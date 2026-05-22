Pod::Spec.new do |s|
  s.name           = 'ICloudBackup'
  s.version        = '1.0.0'
  s.summary        = 'Reads/writes the Car Story backup blob in the iCloud ubiquity container.'
  s.description    = 'Local Expo module exposing coordinated read/write of a single JSON backup file in the app iCloud Documents container.'
  s.author         = 'TeamAM'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
