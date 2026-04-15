package com.eventivapp.jm.delao.widget;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class EventWidgetSyncModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  EventWidgetSyncModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @NonNull
  @Override
  public String getName() {
    return "EventWidgetSync";
  }

  @ReactMethod
  public void saveSnapshot(String payload, Promise promise) {
    try {
      EventWidgetStorage.saveSnapshot(reactContext, payload);
      EventWidgetProvider.refreshAll(reactContext);
      EventWidgetRefreshWorker.scheduleNow(reactContext);
      promise.resolve(true);
    } catch (Exception error) {
      promise.reject("WIDGET_SAVE_ERROR", error);
    }
  }

  @ReactMethod
  public void requestBackgroundRefresh(Promise promise) {
    try {
      EventWidgetRefreshWorker.ensurePeriodic(reactContext);
      EventWidgetProvider.refreshAll(reactContext);
      promise.resolve(true);
    } catch (Exception error) {
      promise.reject("WIDGET_REFRESH_ERROR", error);
    }
  }
}
