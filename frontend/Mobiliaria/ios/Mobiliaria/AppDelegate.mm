#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Eventivapp";
  // You can add your custom initial props in the dictionary below.
  [FIRApp configure];
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [GMSServices provideAPIKey:@"AIzaSyBDsf5kWejRnizKe-DQPb2e4eT-B6c-pfM"];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
