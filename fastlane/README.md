fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
### clean
```
fastlane clean
```
Clean build environment
### prepare
```
fastlane prepare
```
Prepare build environment

----

## iOS
### ios preflightcheck
```
fastlane ios preflightcheck
```
Preflight check for iOS
### ios build
```
fastlane ios build
```
Build iOS
### ios refresh_dsym_upload
```
fastlane ios refresh_dsym_upload
```
Refresh and upload dSYM to Bugsnag
### ios beta
```
fastlane ios beta
```
Release iOS Testflight/beta and notify Bugsnag

----

## Android
### android test
```
fastlane android test
```
Runs all the tests
### android icons
```
fastlane android icons
```
Build android icons
### android build
```
fastlane android build
```
Build android
### android alpha
```
fastlane android alpha
```
Release Android alpha and notify Bugsnag

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
