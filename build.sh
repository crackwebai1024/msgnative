#!/usr/bin/env bash
source getver.sh
# ~/.gradle/gradle.properties  # ^ required to sign android

appVersionBN="$version ($buildnumber)"

bundle exec fastlane ios build
bugsnag-sourcemaps upload --api-key 30c30e3ade52eecca6b7d24fab6b3bfc \
  --app-version "$version ($buildnumber)" \
  --minified-file ios-release.bundle \
  --source-map ios-release.bundle.map \
  --assets-dest ./ios-release \
  --upload-sources \
  --minified-url main.jsbundle \
  --add-wildcard-prefix

bundle exec fastlane android build
bugsnag-sourcemaps upload --api-key 323d3322da613caedd0362f5bce64ca9 \
  --app-version "$version ($buildnumber)" \
  --minified-file ./android/app/build/intermediates/assets/release/index.android.bundle \
  --source-map ./android/app/build/outputs/index.android.js.map \
  --assets-dest ./android-release \
  --upload-sources \
  --minified-url index.android.bundle \
  --add-wildcard-prefix

# iOS
bundle exec fastlane ios beta
rm -f notify.json bugsnag.ios.json
jo -p \
  apiKey=30c30e3ade52eecca6b7d24fab6b3bfc \
  appVersion="`jq -r '.app.version' build.json`" \
  -s appBundleVersion=`jq -r '.app.buildnumber' build.json` \
  releaseStage=production \
  builderName="`jq -r '.metadata.builder' build.json`" \
  sourceControl[provider]=`jq -r '.sourceControl.provider' build.json` \
  sourceControl[repository]=`jq -r '.sourceControl.repository' build.json` \
  sourceControl[revision]=`jq -r '.sourceControl.revision' build.json` \
> notify.json
jq -s add notify.json build.json | tee bugsnag.ios.json | jq .
curl https://build.bugsnag.com/ --header "Content-Type: application/json" --data @bugsnag.ios.json | jq .

# Android
bundle exec fastlane android alpha
rm -f notify.json bugsnag.android.json
jo -p \
  apiKey=323d3322da613caedd0362f5bce64ca9 \
  appVersion=`jq -r '.app.version' build.json` \
  -s appVersionCode=`jq -r '.app.buildnumber' build.json` \
  releaseStage=production \
  builderName="`jq -r '.metadata.builder' build.json`" \
  sourceControl[provider]=`jq -r '.sourceControl.provider' build.json` \
  sourceControl[repository]=`jq -r '.sourceControl.repository' build.json` \
  sourceControl[revision]=`jq -r '.sourceControl.revision' build.json` \
> notify.json
jq -s add notify.json build.json | tee bugsnag.android.json | jq .
curl https://build.bugsnag.com/ --header "Content-Type: application/json" --data @bugsnag.android.json | jq .

rm -f notify.json bugsnag.android.json bugsnag.ios.json

#  react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android-release.bundle --sourcemap-output android-release.bundle.map
# react-native bundle --platform ios --dev false --entry-file index.ios.js --bundle-output ios-release.bundle --sourcemap-output ios-release.bundle.map
