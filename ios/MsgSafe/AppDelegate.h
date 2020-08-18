/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
#import "RNImportService.h"
#import "RNCallKit.h"
//#import "MsgSafe-Swift.h"

#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>
@property RNImportService *importService;
@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, readonly) NSDictionary *trustKitConfig;
@property RNCallKit *callKit;
//@property netPerfWrapper *mSurvey;
@end
