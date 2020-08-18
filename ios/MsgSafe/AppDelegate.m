/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Security/Security.h>
#import "AppDelegate.h"
#import "MsgSafe-Bridging-Header.h"
#import "RNNotifications.h"
#import "RNCallKit.h"
#import "RNImportService.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <PushKit/PushKit.h>
#import <AVFoundation/AVFoundation.h>
#import <BugsnagReactNative/BugsnagReactNative.h>
#import <TrustKit/TrustKit.h>
#import <TrustKit/TSKPinningValidator.h>
#import <TrustKit/TSKPinningValidatorCallback.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
// Caution!!! The following lines should be re-enabled again after netperf library updated.
// Start Collecting Network Survey
//  if (self.mSurvey == nil){
//    self.mSurvey = [[netPerfWrapper alloc] init];
//  }
//  [self.mSurvey startNetPerf];
  
  NSLog(@"MsgSafe didFinishLaunchingWithOptions");
  [BugsnagReactNative start];

  // SSL pinning
  // Override TrustKit's logger method
  void (^loggerBlock)(NSString *) = ^void(NSString *message)
  {
    NSLog(@"TrustKit log: %@", message);
    
  };
  [TrustKit setLoggerBlock:loggerBlock];
  
  // Initialize TrustKit
  _trustKitConfig =
  @{
    // Do not auto-swizzle NSURLSession delegates
    kTSKSwizzleNetworkDelegates: @YES,
    
    kTSKPinnedDomains: @{
        
        // this is for test
        @"yahoo.com": @{
            kTSKEnforcePinning: @YES,
            kTSKIncludeSubdomains: @YES,
            kTSKPublicKeyAlgorithms: @[kTSKAlgorithmRsa2048],
            
            // Wrong SPKI hashes to demonstrate pinning failure
            kTSKPublicKeyHashes: @[
                @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                @"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
                ],
            
            // Send reports for pinning failures
            // Email info@datatheorem.com if you need a free dashboard to see your App's reports
            //            kTSKReportUris: @[@"https://overmind.datatheorem.com/trustkit/report"]
            },
        
        
        @"api-stage.msgsafe.io" : @{
            kTSKEnforcePinning:@YES,
            kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
            
            // Valid SPKI hashes to demonstrate success
            kTSKPublicKeyHashes : @[
//                @"HXXQgxueCIU5TTLHob/bPbwcKOKw6DkfsTWYHbxbqTY=",
//                @"0SDf3cRToyZJaMsoS17oF72VMavLxj/N7WBNasNuiR8="
//                @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                @"Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA=", // Correct Key for api-stage.msgsafe.io
                @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // Fake key but 2 pins need to be provided
                ]
            },
        @"api6.msgsafe.io" : @{
            kTSKEnforcePinning:@YES,
            kTSKPublicKeyAlgorithms : @[kTSKAlgorithmRsa2048],
            
            // Valid SPKI hashes to demonstrate success
            kTSKPublicKeyHashes : @[
//                @"HXXQgxueCIU5TTLHob/bPbwcKOKw6DkfsTWYHbxbqTY=",
//                @"0SDf3cRToyZJaMsoS17oF72VMavLxj/N7WBNasNuiR8="
//                @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                @"Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA=", // Correct Key for api.msgsafe.io
                @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // Fake key but 2 pins need to be provided
                ]
            }    
          }};
  
  [TrustKit initSharedInstanceWithConfiguration:_trustKitConfig];
  
  // Demonstrate how to receive pin validation notifications (only useful for performance/metrics)
  [TrustKit sharedInstance].pinningValidatorCallbackQueue = dispatch_get_main_queue();
  [TrustKit sharedInstance].pinningValidatorCallback = ^(TSKPinningValidatorResult *result, NSString *notedHostname, TKSDomainPinningPolicy *policy) {
    if (result && result.evaluationResult == TSKTrustEvaluationSuccess) {
      
    } else {
      dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"SSL Pinning" message:@"Pinning validation failed. Your network requests will be blocked. Please use right certification keys." preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                                              handler:^(UIAlertAction * action) {}];
        
        [alert addAction:defaultAction];
        [self.window.rootViewController presentViewController:alert animated:YES completion:nil];
      });
    }
    
    NSLog(@"Received pinning validation notification:\n\tDuration: %0.4f\n\tDecision: %ld\n\tResult: %ld\n\tHostname: %@",
          result.validationDuration,
          (long)result.finalTrustDecision,
          (long)result.evaluationResult,
          result.serverHostname);
  };
  
  NSURL *jsCodeLocation;
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  /* pre-callKit
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                    moduleName:@"MsgSafe"
                                                    initialProperties:nil
                                                    launchOptions:launchOptions];
  */
  self.importService = [[RNImportService alloc] init];
  RNCallKit *rncallkit = [[RNCallKit alloc] init];
  self.callKit = rncallkit;
  // TODO: configuaration should come from the storage
  [rncallkit _setup: @{ @"appName": @"MsgSafe", @"imageName": @"callKitIcon.png", @"ringtoneSound": @"ring.mp3" }];
  // TODO: token should be processed in the JS side.
  if ([self getSavedCredentials]) {
    [self registerPushKit];
  }
  
  NSLog(@"MsgSafe RNCallKit initialized");
  RCTBridge *bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
                                            moduleProvider:^{ return @[rncallkit, self.importService]; }
                                             launchOptions:launchOptions];
  NSLog(@"MsgSafe RCTBridge initialized");

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"MsgSafe"
                                            initialProperties:nil];
  NSLog(@"MsgSafe rootView initialized");

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  NSLog(@"MsgSafe UIViewController initialized");
  // Set the LaunchImage as the background for the initial view; avoid white flash
  // Source - https://github.com/facebook/react-native/issues/1402#issuecomment-228095427
  NSArray *allPngImageNames = [[NSBundle mainBundle] pathsForResourcesOfType:@"png" inDirectory:nil];
  for (NSString *imgName in allPngImageNames){
    if ([imgName containsString:@"LaunchImage"]){
      UIImage *img = [UIImage imageNamed:imgName];
      
      if (img.scale == [UIScreen mainScreen].scale && CGSizeEqualToSize(img.size, [UIScreen mainScreen].bounds.size)) {
        rootView.backgroundColor = [UIColor colorWithPatternImage:img];
//        NSLog(@"Setting background image - %@", imgName);
      }
    }
  }
  
  [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryAmbient error:nil]; // Allow other app background music playing
  
  NSLog(@"MsgSafe didFinishLoadingWithOptions return YES");
  return YES;
}
- (void) registerPushKit {
  // Register Push Kit
  PKPushRegistry* pushKitRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
  
  // Set the registry delegate to app delegate
  pushKitRegistry.delegate = self;
  pushKitRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}
-(BOOL)application:(UIApplication *)application
           openURL:(NSURL *)url
 sourceApplication:(NSString *)sourceApplication
        annotation:(id)annotation {
  if (url != nil && [url isFileURL]) {
    [self.importService sendImportedFileNotification:url];
  }
  return YES;
}

// This delegate will be called when the user tries to start a call from native Phone App
- (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void(^)(NSArray * __nullable restorableObjects))restorationHandler
{
  return [RNCallKit application:application
           continueUserActivity:userActivity
             restorationHandler:restorationHandler];
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RNNotifications didRegisterUserNotificationSettings:notificationSettings];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

// Required for the notification event.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification
{
  [RNNotifications didReceiveRemoteNotification:notification];
}

// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RNNotifications didReceiveLocalNotification:notification];
}

// PushKit API Support
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type
{
  NSLog(@"MsgSafe pushRegistry didUpdatePushCredentials");
  [RNNotifications didUpdatePushCredentials:credentials forType:type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type
{
//  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:payload.dictionaryPayload
//                                                     options:NSJSONWritingPrettyPrinted error: nil];
//  NSString *myString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
//  NSLog(myString);
//
//  NSDictionary* data = payload.dictionaryPayload;
//  NSString* webrtc_call = @"WEBRTC_CALL";
//  NSString* call_type = [data objectForKey:@"type"];
//  if ([webrtc_call isEqualToString: call_type]) {
//    NSString* call_id = [data objectForKey:@"call_id"];
//    NSString* from_email = [data valueForKeyPath: @"call_args.from_email"];
//    Boolean is_audio_only = [[data valueForKeyPath:@"call_args.is_audio_only"] boolValue];
//    [self.callKit _displayIncomingCall:call_id handle:from_email handleType:@"email" hasVideo:!is_audio_only localizedCallerName:from_email];
//  }

  [RNNotifications didReceiveRemoteNotification:payload.dictionaryPayload];
}

- (Boolean) getSavedCredentials
{
  NSString *service = [[NSBundle mainBundle] bundleIdentifier];
  
  // Create dictionary of search parameters
  NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithObjectsAndKeys:(__bridge id)(kSecClassGenericPassword), kSecClass, service, kSecAttrService, kCFBooleanTrue, kSecReturnAttributes, kCFBooleanTrue, kSecReturnData, nil];
  
  /*if (options && options[@"accessGroup"]) {
    [dict setObject:options[@"accessGroup"] forKey:kSecAttrAccessGroup];
  }*/
  
  // Look up server in the keychain
  NSDictionary* found = nil;
  CFTypeRef foundTypeRef = NULL;
  OSStatus osStatus = SecItemCopyMatching((__bridge CFDictionaryRef) dict, (CFTypeRef*)&foundTypeRef);
  
  if (osStatus != noErr && osStatus != errSecItemNotFound) {
    NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
    NSLog([error localizedDescription]);
    return false;
  }
  
  found = (__bridge NSDictionary*)(foundTypeRef);
  if (!found) {
    return false;
  }
  
  // Found
//  NSString* username = (NSString *) [found objectForKey:(__bridge id)(kSecAttrAccount)];
//  NSString* password = [[NSString alloc] initWithData:[found objectForKey:(__bridge id)(kSecValueData)] encoding:NSUTF8StringEncoding];
  return true;
}
@end
