#!/usr/bin/env bash

base=`pwd`
cd $base/android
echo 'Building app...'
./gradlew assembleRelease
mkdir -p app/build/outputs

if [ $? -ne 0 ]
  then exit 1
fi

for SERIAL in $(adb devices | grep -v List | cut -f 1);
do
  echo "Uninstalling existing app install on ${SERIAL}"
  adb -s $SERIAL uninstall io.msgsafe.android 2>/dev/null
  echo "Installing the latest build on $SERIAL"
  adb -s $SERIAL install -r ./app/build/outputs/apk/release/app-release.apk
  echo "Launching app on $SERIAL"
  adb -s $SERIAL shell am start -n io.msgsafe.android/io.msgsafe.android.MainActivity
done

cd $base
