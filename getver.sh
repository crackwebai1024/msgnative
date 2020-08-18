#!/usr/bin/env bash

[ ! -f "appversion.json" ] && {
  echo "appversion.json is missing, aborting..."
  exit 1
}

url="https://www.msgsafe.io"
name=$(basename `git rev-parse --show-toplevel`)
revision=`git rev-parse HEAD`
formfactor=`echo $name | sed -e 's/msgsafe-//g'`
version=`jq -r .version package.json`
buildnumber=`jq -r .build.number appversion.json`
nativeversion="$version ($buildnumber)"
stage=`jq -r .status.stage appversion.json`
tag=$version+$stage.$buildnumber+`date "+%Y%m%d"`+$formfactor
json -I -f package.json -e 'this.build="'$buildnumber'"' >/dev/null 2>&1  # update package.json
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" ios/MsgSafe/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $buildnumber" ios/MsgSafe/Info.plist
rn=`react-native -v | grep -v cli | cut -f2 -d':'`
rn_cli=`react-native -v | grep cli | cut -f2 -d':'`
brew=`brew -v 2>&1 | head -1 | sed -e 's/Homebrew //g'`
netperfandroid=$(echo `sed 's/[^0-9]*//g' android/netperf-lib/build.gradle`)
netperfios=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/Netperf.framework/Info.plist)

rm -f build.json
jo -p \
  app[name]=$name \
  app[url]=$url \
  app[version]=$version \
  app[stage]=$stage \
  -s app[buildnumber]=$buildnumber \
  app[tag]=$tag \
  app[revision]=$revision \
  metadata[builder]='TrustCor Systems S. de R.L.' \
  metadata[nodename]="sentry" \
  metadata[version]=$version \
  metadata[nativeversion]="$nativeversion" \
  -s metadata[netperf_android]=$netperfandroid \
  -s metadata[netperf_ios]=$netperfios \
  metadata[tag]=$tag \
  metadata[node]=`node -v` \
  metadata[yarn]=`yarn -v` \
  metadata[npm]=`npm -v` \
  -s metadata[brew]="$brew" \
  metadata[gem]=`gem -v` \
  metadata[os_arch]=`uname -m` \
  metadata[os_release]=`uname -r` \
  metadata[os_name]=`uname -s` \
  -s metadata[react_native]="$rn" \
  -s metadata[react_native_cli]="$rn_cli" \
  sourceControl[revision]=$revision \
  sourceControl[provider]='github-enterprise' \
  sourceControl[repository]='https://git.trustcorsystems.com/msgsafe/msgsafe-native' \
    > build.json

jq . build.json
