#!/usr/bin/env bash

# we can clean this up later, but if 8081 is taken when we start the build, we know the build will fail
PORT_TAKEN=`lsof -i -P -n | grep "8081 (LISTEN)" | wc -l`
[ $PORT_TAKEN -gt 0 ] && {
  echo "Port 8081 is currently in use, aborting build"
  exit 1
}

base=`pwd`
cd $base/commons ; git checkout master ; git pull
cd $base/translations ; git checkout master ; git pull
cd $base ; git checkout master ; git pull

apv update build
major=`jq .version.major appversion.json | tr -d '\n'`
minor=`jq .version.minor appversion.json | tr -d '\n'`
patch=`jq .version.patch appversion.json | tr -d '\n'`
stage=`jq .status.stage appversion.json | tr -d '\n' | sed -e 's/"//g'`
build=`jq .build.number appversion.json | tr -d '\n'`

version=$major.$minor.$patch
tag=$major.$minor.$patch+"build".$build+`date "+%Y%m%d"`.$stage+"native"

echo "$version ($build) -- $tag"
json -I -f package.json -e 'this.version="'$version'"'
json -I -f package.json -e 'this.build="'$build'"'
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" ios/MsgSafe/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $build" ios/MsgSafe/Info.plist

git commit -a -m "$tag" ; git push
cd $base/commons ; git tag -a -m "$tag" "$tag" ; git push --tags
cd $base/translations ; git tag -a -m "$tag" "$tag" ; git push --tags
cd $base ; git tag -a -m "$tag" "$tag" ; git push --tags

bundle exec fastlane beta
