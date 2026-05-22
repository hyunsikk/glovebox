import ExpoModulesCore
import Foundation

// Reads/writes a single backup file in the app's iCloud Documents (ubiquity)
// container. The container id is configured via the iCloud entitlement injected
// by plugins/withICloudBackup.js; passing nil to forUbiquityContainerIdentifier
// uses that first configured container.
//
// All work runs on Expo's async function queue (AsyncFunction), never the main
// thread — forUbiquityContainerIdentifier and file coordination can block.
public class ICloudBackupModule: Module {
  // Only allow simple backup filenames inside the container (no path traversal).
  private func safe(_ name: String) -> String {
    return name.replacingOccurrences(of: "/", with: "_")
  }

  public func definition() -> ModuleDefinition {
    Name("ICloudBackup")

    AsyncFunction("isAvailable") { () -> Bool in
      return self.ubiquityDocumentsURL() != nil
    }

    // Write a named file into the iCloud Documents container.
    AsyncFunction("writeFile") { (name: String, contents: String) -> Bool in
      guard let dir = self.ensureDocumentsURL() else { throw ICloudUnavailableException() }
      try self.coordinatedWrite(contents, to: dir.appendingPathComponent(self.safe(name)))
      return true
    }

    // Read a named file (downloading from iCloud first if needed). nil if absent.
    AsyncFunction("readFile") { (name: String) -> String? in
      guard let dir = self.ubiquityDocumentsURL() else { throw ICloudUnavailableException() }
      return try self.coordinatedRead(from: dir.appendingPathComponent(self.safe(name)))
    }

    // List the filenames currently in the container (metadata only — names are
    // available even when the file contents aren't downloaded yet).
    AsyncFunction("listFiles") { () -> [String] in
      guard let dir = self.ensureDocumentsURL() else { throw ICloudUnavailableException() }
      let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
      return names
    }

    AsyncFunction("deleteFile") { (name: String) -> Bool in
      guard let dir = self.ubiquityDocumentsURL() else { throw ICloudUnavailableException() }
      let url = dir.appendingPathComponent(self.safe(name))
      try? FileManager.default.removeItem(at: url)
      return true
    }
  }

  // MARK: - container helpers

  private func ubiquityDocumentsURL() -> URL? {
    guard let base = FileManager.default.url(forUbiquityContainerIdentifier: nil) else {
      return nil // not signed into iCloud, or iCloud Drive disabled
    }
    return base.appendingPathComponent("Documents", isDirectory: true)
  }

  private func ensureDocumentsURL() -> URL? {
    guard let dir = ubiquityDocumentsURL() else { return nil }
    if !FileManager.default.fileExists(atPath: dir.path) {
      try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    }
    return dir
  }

  private func coordinatedWrite(_ contents: String, to fileURL: URL) throws {
    let coordinator = NSFileCoordinator()
    var coordError: NSError?
    var writeError: Error?
    coordinator.coordinate(writingItemAt: fileURL, options: .forReplacing, error: &coordError) { url in
      do {
        try contents.write(to: url, atomically: true, encoding: .utf8)
      } catch {
        writeError = error
      }
    }
    if let error = coordError { throw error }
    if let error = writeError { throw error }
  }

  private func coordinatedRead(from fileURL: URL) throws -> String? {
    let fm = FileManager.default

    // The file may be present in iCloud metadata but not downloaded locally yet.
    if !fm.fileExists(atPath: fileURL.path) {
      try? fm.startDownloadingUbiquitousItem(at: fileURL)
      let deadline = Date().addingTimeInterval(15)
      while !fm.fileExists(atPath: fileURL.path) && Date() < deadline {
        Thread.sleep(forTimeInterval: 0.3)
      }
      if !fm.fileExists(atPath: fileURL.path) {
        return nil // no backup yet, or download timed out
      }
    }

    let coordinator = NSFileCoordinator()
    var coordError: NSError?
    var readError: Error?
    var result: String?
    coordinator.coordinate(readingItemAt: fileURL, options: .withoutChanges, error: &coordError) { url in
      do {
        result = try String(contentsOf: url, encoding: .utf8)
      } catch {
        readError = error
      }
    }
    if let error = coordError { throw error }
    if let error = readError { throw error }
    return result
  }
}

private final class ICloudUnavailableException: Exception, @unchecked Sendable {
  override var reason: String {
    "iCloud is unavailable. Sign into iCloud and enable iCloud Drive, then try again."
  }
}
