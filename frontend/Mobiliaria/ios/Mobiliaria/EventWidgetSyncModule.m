#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "EventWidgetConstants.h"

@interface EventWidgetSync : NSObject <RCTBridgeModule>
@end

@implementation EventWidgetSync

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(saveSnapshot,
                 saveSnapshot:(NSString *)payload
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:kEventWidgetAppGroup];
  if (sharedDefaults == nil) {
    reject(@"WIDGET_GROUP_ERROR", @"No se pudo abrir el App Group para widgets.", nil);
    return;
  }

  [sharedDefaults setObject:payload forKey:kEventWidgetSnapshotKey];
  [sharedDefaults synchronize];
  resolve(@(YES));
}

RCT_REMAP_METHOD(requestBackgroundRefresh,
                 requestBackgroundRefreshWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@(YES));
}

@end
