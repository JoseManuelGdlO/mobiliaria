package com.eventivapp.jm.delao.widget;

import android.content.Context;
import android.content.SharedPreferences;

public final class EventWidgetStorage {
  public static final String PREFS_NAME = "event_widget_snapshot_store";
  public static final String KEY_SNAPSHOT = "day_snapshot";

  private EventWidgetStorage() {}

  public static void saveSnapshot(Context context, String snapshotJson) {
    SharedPreferences sharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    sharedPreferences.edit().putString(KEY_SNAPSHOT, snapshotJson).apply();
  }

  public static String readSnapshot(Context context) {
    SharedPreferences sharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    return sharedPreferences.getString(KEY_SNAPSHOT, null);
  }
}
