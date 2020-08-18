
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#endif

@interface RNImportService : RCTEventEmitter <RCTBridgeModule>
@property NSString *url;
@property NSString *FILES_IMPORTED;

-(void) sendImportedFileNotification:(NSURL *)url;
@end

