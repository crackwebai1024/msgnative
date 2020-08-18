
#import "RNImportService.h"

@implementation RNImportService

- (id) init {
    self = [super init];
    if (self != nil) {
        self.url = NULL;
        self.FILES_IMPORTED = @"FILES_IMPORTED";
        // initializations go here.
    }
    return self;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

- (NSDictionary *)constantsToExport
{
    return @{ self.FILES_IMPORTED : self.FILES_IMPORTED };
};

- (NSArray<NSString *> *)supportedEvents
{
    return @[self.FILES_IMPORTED];
}

- (void)sendImportedFileNotification:(NSURL *)url
{
    self.url = [url absoluteString];
    [self sendEventWithName:self.FILES_IMPORTED body:@[self.url]];
}

RCT_EXPORT_METHOD(getImportedFileURL:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], @[self.url]]);
}

// check last imported file
RCT_EXPORT_METHOD(checkImportedFiles)
{
    if (self.url != NULL) {
        [self sendEventWithName:self.FILES_IMPORTED body:@[self.url]];
    }
}

RCT_EXPORT_METHOD(saveIndentities: (NSArray*) identities )
{
    NSUserDefaults* userDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.msgsafe.io"];
    [userDefaults setObject:identities forKey:@"indentities"];
    [userDefaults synchronize];
}

@end

