# Application Versioning Information

* Android
  * versionCode
  * versionName
* iOS
  * CFBundleVersion
  * CFBundleShortVersionString


ios/MsgSafe/info.plist:
"""
        <key>CFBundleShortVersionString</key>
        <string>1.0</string>
        ...
        <key>CFBundleVersion</key>
        <string>205</string>
"""

android/app/build.gradle:
"""
        versionCode 205
        versionName "1.0"
"""

## Android

* versionCode — An integer used as an internal version number. This number is used only to determine whether one
version is more recent than another, with higher numbers indicating more recent versions. This is not the version
number shown to users; that number is set by the versionName setting, below. The Android system uses the versionCode
value to protect against downgrades by preventing users from installing an APK with a lower versionCode than the
version currently installed on their device.

The value is an integer so that other apps can programmatically evaluate it, for example to check an upgrade or
downgrade relationship. You can set the value to any integer you want, however you should make sure that each
successive release of your app uses a greater value. You cannot upload an APK to the Play Store with a versionCode
you have already used for a previous version.

Typically, you would release the first version of your app with versionCode set to 1, then monotonically increase
the value with each release, regardless of whether the release constitutes a major or minor release. This means that
the versionCode value does not necessarily have a strong resemblance to the app release version that is visible to
the user (see versionName, below). Apps and publishing services should not display this version value to users.

Warning: The greatest value Google Play allows for versionCode is 2100000000.

* versionName — A string used as the version number shown to users. This setting can be specified as a raw string or
as a reference to a string resource.

The value is a string so that you can describe the app version as a <major>.<minor>.<point> string, or as any other
type of absolute or relative version identifier. The versionName has no purpose other than to be displayed to users.

https://developer.android.com/studio/publish/versioning.html


## Apple

### Introduction

Version and the build numbers work together to uniquely identify a particular App Store submission for an app. The
conventions for how these numbers work together are verified by automatic processes when you submit your app to the
App Store, so understanding how these numbers work and how they are intended to be used will help you save time when
submitting your app. The following details how these numbers work and the various places that they appear in your
Xcode projects.

### Definitions

For each new version of your app, you will provide a version number to differentiate it from previous versions. The
version number works like a name for each release of your app. For example, version 1.0.0 may name the first release,
version 2.0.1 will name the second, and so on. When submitting a new release of your app to the App Store, it is normal
to have some false starts. You may forget an icon in one build, or perhaps there is a problem in another build. As a
result, you may produce many builds during the process of submitting a new release of your app to the App Store.
Because these builds will be for the same release of your app, they will all have the same version number. But, each
of these builds must have a unique build number associated with it so it can be differentiated from the other builds
you have submitted for the release. The collection of all of the builds submitted for a particular version is referred
to as the 'release train' for that version.

### Two naming conventions for version numbers and build numbers

Note that the names or key values displayed in Figure 4 are displayed in their human readable format. If you
right-click (or click while holding the control key) in the display you can select "Show Raw Keys/Values" from
the popup menu to see the machine-readable versions of these keys.

Note that the version number is saved with the key CFBundleShortVersionString and the build number is associated
with the key CFBundleVersion. You will find the version number (CFBundleShortVersionString) and build number
(CFBundleVersion) described in many different places in the documentation and referred to using these key values.
In this document, we will continue to refer to these values as the version number and the build number.

### How these numbers work together

The version number and the build number values work together to uniquely identify the build and release for a particular
App Store submission. For each new version of your app, you will provide a new unique version number and you may provide
one or more builds (or submissions) each with a different and unique build number together with that same version number.
All version numbers used in an app must be unique. You cannot re-use version numbers. Also, as you create new releases,
new version numbers must be added in ascending sequential order.

Build numbers provide a way to name each of the submissions you provide for a particular release. As described in the
definitions above, the collection of all of the builds that you provide for a particular version of your app is called
that version's 'release train'. For iOS apps, build numbers must be unique within each release train, but they do not
need to be unique across different release trains. That is to say, for iOS Apps you can use the same build numbers again
in different release trains if you want to. However, for macOS apps, build numbers must monotonically increase even across
different versions. In other words, for macOS apps you cannot use the same build numbers again in different release trains.
And, as you create and submit new builds for any release, the build numbers you assign to them must be in ascending
sequential order.

Important: For macOS apps, build numbers must monotonically increase even across different versions. In other words, for
macOS apps you cannot use the same build numbers again in different release trains. iOS apps have no such restriction and
you can re-use the same build numbers again in different release trains.

It is normal to use the same version number many times over and over again with different Build Numbers when uploading submissions for a particular release of your app.

https://developer.apple.com/library/content/technotes/tn2420/_index.html
