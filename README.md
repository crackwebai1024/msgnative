# State of WebRTC calls in app

- 100% call success rate (as on July 23, 2018)
- uses trickle ICE
- not forcing TCP/relay only candidates

[Some firewalls block UDP entirely](https://tools.ietf.org/html/rfc5766#section-2.1), where it would be necessary to force TCP relay but it should only be used as a fallback.  We were defaulting to forcing TCP relay but have decided to not do that for now as it prevents P2P calls using STUN candidates right now.  It'd be better to implement call stats logging for diagnostics on chatd so that we can know about call failures and implement TCP only fallback.

# Websocket connection (chatd)

The goal is to keep the websocket alive as long as the app in foreground or there's an inbound/active call in place.  The websocket should be alive the entire duration of any call activity, since it acts as the only signaling server for clients to exchange SDP offer, ICE candidates and other call events.

- The websocket stays connected all the time when app is in foreground
- If there's an inbound call when app is in background or it has a cold launch, the websocket is connected to facilitate signaling.
- When app is minimized (i.e. goes to background), app waits for 5 seconds before disconnecting the websocket.  This is because on Android, when the permission modal or inbound call screen pops up, the app goes into `background` state.  Also, if user accidentally minimize the app and quickly come back, the socket is kept alive.
- When there's an inbound or active call, websocket isn't disconnected even if app goes into background.
- After a call ends, if the app is found to be in background state, the websocket is immediately disconnected.

## Websocket Caveats - 

- Since there is a 5 second delay in closing the websocket when app goes into foreground, any messages sent towards a user during this 5s window won't generate any push notification (because according to the server, the user still has an active socket and is online)

## iOS Push Notification

- The ability of APNs to deliver remote notifications to a nonrunning app requires the app to have been launched at least once.
- On an iOS device, if a user force-quits your app using the app multitasking UI, the app does not receive remote notifications until the user relaunches it.
- Never cache device tokens in your app; instead, get them from the system when you need them. APNs issues a new device token to your app when certain events happen.
- The device token is guaranteed to be different, for example, when a user restores a device from a backup, when the user installs your app on a new device, and when the user reinstalls the operating system.
- Fetching the token, rather than relying on a cache, ensures that you have the current device token needed for your provider to communicate with APNs. When you attempt to fetch a device token but it has not changed, the fetch method returns quickly.
- When a device token has changed, the user must launch your app once before APNs can once again deliver remote notifications to the device.

Source – https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/HandlingRemoteNotifications.html

# Running

## Window 1
react-native start --reset-cache 

## Window 2
react-native run-ios --simulator "iPhone 7 Plus"

# Pushing to iTunes Connect (and TestFlight)

First, make sure that both iTunes Connect *and* Apple Developer Program accounts are added in Xcode > Preferences > Accounts. If the appropriate `Apple Developer Program` account is added, Xcode should automatically deal with provisioning and certs stuff. And if appropriate `iTunes Connect` is added in Xcode, this will let you push app build to iTunes Connect.

## Preparing Archive

- Bump the build number – select MsgSafe project and then “General tab" (we probably won’t need to bump version number, until we are ready push new versions of app build to app store)
- in Xcode, go to menubar's Product > Scheme > Edit Scheme
- with “Run” tab selected on the left, set “Build Configuration” to Release and close this dialog
- set ‘Generic iOS device’ as the target device at top left (right where we select simulator device type)
- in menubar, Product > Archive – this will create an archive that can be uploaded to iTunes Connect or exported for manually installing on a device with iTunes

## Pushing to iTunes Connect using Application Loader

- Export -> Save for iOS App Store Deployment (save it where you can easily find it)
- Menu Bar -> Xcode -> Open developer tool -> Application Loader
- Choose "Deliver your app" and select the exported .ipa file

## Pushing to iTunes Connect directly (sucks)

- in menubar, Window > Organizer – select the archive build that you just did and hit “Upload to App Store…” button on right. bad wording by Apple, this won’t cause it to be queued for App Store publishing but just make the build available in iTunes Connect
- rest of the stuff after hitting the button is straightforward, just choose the Team and hit next buttons
- once the upload is finished on Xcode’s end, open iTunes Connect, wait/check for the build status, takes ~10min to process
- once the build is processed, open the “Test Flight” page, select the version to test, choose the latest build and it will be made available to all the testers


# Android

- Follow instructions at for Android at – https://facebook.github.io/react-native/docs/getting-started.html
- In Android Studio's launch screen, go to Configure => SDK Tools, check NDK and hit OK to install it
- The AVG manager icon might be disabled when MsgSafe android project is opened in Android Studio.  In order to access AVD manager, create a new default project in Android and the AVD manager icon should now be available.
- Create an emulator based on instructions in the above link and launch the emulator
- Open two terminals and run –
    - react-native start --reset-cache
    - react-native run-android

Build signed APK – https://facebook.github.io/react-native/docs/signed-apk-android.html


# Notes
  - Use `BaseText` instead of `Text` to have a common font family

---

App boilerplate and structure based on https://github.com/infinitered/ignite

---

Instructions for adding custom launch screen for iOS –

- Use the `misc/generate_iOS_launch_images.sh`
- Place Default-Input.png with preferably 2208x2208 or larger dimension in the same directory and run the above script
- Create a new LaunchImage in Xcode and drag the generated files as per the following mappings
    - `iPhone Portrait (iOS 5,6)`
        - `1x` -> 320x480
        - `2x` -> 640x960
        - `Retina 4` -> 640x1136
    - `iPhone Portrait (iOS 8,9)`
        - `Retina HD 5.5"` -> 1242x2208
        - `Retina HD 4.7"` -> 750x1134
    - `iPhone Landscape (iOS 8,9)`
        - `Retina HD 5.5"` -> 2208x1242
    - `iPhone Portrait (iOS 7-9)`
        - `2x` -> 640x960
        - `Retina 4` -> 640x1136

Size guide - https://medium.com/@jigarm/ios-app-icon-and-launch-image-sizes-e8d5990cb72b

---

#Weird issues
    - Don't name any file as `Config.js` (It causes issue on release build)

# 2018 Build notes

jq -r ".version" package.json
1.0.1
jq -r ".build" package.json
561

json -I -f package.json -e 'this.build="562"'

obviously, package.json was updated to seed CI processes that are incomplete -- I will revisit -- paused 20180206
