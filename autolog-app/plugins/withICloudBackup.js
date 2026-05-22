/**
 * Config plugin: enable the iCloud Documents capability for the iCloud backup
 * module. Injects the iCloud entitlement (container + CloudDocuments service)
 * and the NSUbiquitousContainers Info.plist declaration at prebuild time.
 *
 * Apple-side prerequisites (one-time, done in the Apple Developer portal):
 *   1. Enable the iCloud capability on App ID dev.teamam.glovebox.
 *   2. Create an iCloud container named `iCloud.dev.teamam.glovebox`.
 *   3. Regenerate the provisioning profile (EAS does this with managed creds).
 */

const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const CONTAINER_ID = 'iCloud.dev.teamam.glovebox';

const withICloudEntitlements = (config) =>
  withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.icloud-container-identifiers'] = [CONTAINER_ID];
    cfg.modResults['com.apple.developer.icloud-services'] = ['CloudDocuments'];
    cfg.modResults['com.apple.developer.ubiquity-container-identifiers'] = [CONTAINER_ID];
    return cfg;
  });

const withICloudInfoPlist = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.NSUbiquitousContainers = {
      [CONTAINER_ID]: {
        NSUbiquitousContainerIsDocumentScopePublic: true,
        NSUbiquitousContainerName: 'Car Story',
        NSUbiquitousContainerSupportedFolderLevels: 'Any',
      },
    };
    return cfg;
  });

module.exports = (config) => withICloudInfoPlist(withICloudEntitlements(config));
