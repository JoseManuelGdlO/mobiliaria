package com.eventivapp.jm.delao.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.RemoteViews;
import com.eventivapp.jm.delao.R;
import org.json.JSONArray;
import org.json.JSONObject;

public class EventWidgetProvider extends AppWidgetProvider {
  @Override
  public void onEnabled(Context context) {
    super.onEnabled(context);
    EventWidgetRefreshWorker.ensurePeriodic(context);
  }

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    for (int appWidgetId : appWidgetIds) {
      updateWidget(context, appWidgetManager, appWidgetId);
    }
  }

  @Override
  public void onAppWidgetOptionsChanged(
      Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
    super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
    updateWidget(context, appWidgetManager, appWidgetId);
  }

  public static void refreshAll(Context context) {
    AppWidgetManager manager = AppWidgetManager.getInstance(context);
    ComponentName widgetComponent = new ComponentName(context, EventWidgetProvider.class);
    int[] ids = manager.getAppWidgetIds(widgetComponent);
    for (int appWidgetId : ids) {
      updateWidget(context, manager, appWidgetId);
    }
  }

  private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.event_widget_layout);
    String snapshotRaw = EventWidgetStorage.readSnapshot(context);
    Bundle options = manager.getAppWidgetOptions(widgetId);

    bindHeader(context, views, snapshotRaw);
    bindBody(context, views, snapshotRaw, options);
    bindOpenAppIntent(context, views);

    manager.updateAppWidget(widgetId, views);
  }

  private static void bindHeader(Context context, RemoteViews views, String snapshotRaw) {
    views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_title));
    views.setTextViewText(R.id.widget_subtitle, context.getString(R.string.widget_subtitle_empty));
    if (snapshotRaw == null) {
      return;
    }

    try {
      JSONObject snapshot = new JSONObject(snapshotRaw);
      String displayMode = snapshot.optString("displayMode", "today");
      String listDateLabel = snapshot.optString("listDateLabel", "");
      String listDate = snapshot.optString("listDate", snapshot.optString("date", ""));
      String total = snapshot.optString("total", "0");
      JSONArray events = snapshot.optJSONArray("events");
      int eventCount = events != null ? events.length() : 0;

      if ("next".equalsIgnoreCase(displayMode) && eventCount > 0) {
        String hint = !listDateLabel.isEmpty() ? listDateLabel : listDate;
        views.setTextViewText(R.id.widget_subtitle, context.getString(R.string.widget_subtitle_next, hint));
        return;
      }

      if (eventCount > 0 && !listDate.isEmpty()) {
        views.setTextViewText(
            R.id.widget_subtitle, context.getString(R.string.widget_subtitle_template, listDate, total));
        return;
      }

      if (eventCount == 0) {
        views.setTextViewText(R.id.widget_subtitle, context.getString(R.string.widget_subtitle_no_events));
      }
    } catch (Exception ignored) {
      // Keep fallback subtitle when snapshot cannot be parsed.
    }
  }

  private static void bindBody(Context context, RemoteViews views, String snapshotRaw, Bundle options) {
    TextRow[] rows = {
      new TextRow(R.id.widget_row1_time, R.id.widget_row1_title, R.id.widget_row1_addr),
      new TextRow(R.id.widget_row2_time, R.id.widget_row2_title, R.id.widget_row2_addr),
      new TextRow(R.id.widget_row3_time, R.id.widget_row3_title, R.id.widget_row3_addr),
      new TextRow(R.id.widget_row4_time, R.id.widget_row4_title, R.id.widget_row4_addr),
      new TextRow(R.id.widget_row5_time, R.id.widget_row5_title, R.id.widget_row5_addr)
    };

    int rowsToShow = resolveRowLimit(options);
    boolean showAddress = resolveShowAddress(options);
    int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;

    if (snapshotRaw == null) {
      views.setViewVisibility(R.id.widget_rows_container, View.GONE);
      views.setViewVisibility(R.id.widget_empty, View.VISIBLE);
      views.setTextViewText(R.id.widget_empty, context.getString(R.string.widget_subtitle_empty));
      views.setViewVisibility(R.id.widget_footer, View.GONE);
      return;
    }

    JSONArray events = new JSONArray();
    if (snapshotRaw != null) {
      try {
        JSONObject snapshot = new JSONObject(snapshotRaw);
        JSONArray ev = snapshot.optJSONArray("events");
        if (ev != null) {
          events = ev;
        }
      } catch (Exception ignored) {
        events = new JSONArray();
      }
    }

    if (events.length() == 0) {
      views.setViewVisibility(R.id.widget_rows_container, View.GONE);
      views.setViewVisibility(R.id.widget_empty, View.VISIBLE);
      views.setTextViewText(R.id.widget_empty, context.getString(R.string.widget_empty_today));
    } else {
      views.setViewVisibility(R.id.widget_rows_container, View.VISIBLE);
      views.setViewVisibility(R.id.widget_empty, View.GONE);

      for (int i = 0; i < rows.length; i++) {
        if (i >= rowsToShow) {
          views.setViewVisibility(rows[i].timeId, View.GONE);
          views.setViewVisibility(rows[i].titleId, View.GONE);
          views.setViewVisibility(rows[i].addrId, View.GONE);
          continue;
        }

        views.setViewVisibility(rows[i].timeId, View.VISIBLE);
        views.setViewVisibility(rows[i].titleId, View.VISIBLE);

        JSONObject row = events.optJSONObject(i);
        String time = row != null ? row.optString("time", "--:--") : "--:--";
        String title = row != null ? row.optString("title", "Sin titular") : "Sin titular";
        String address = row != null ? row.optString("address", "") : "";
        boolean paid =
            row != null && (row.optBoolean("paid", false) || row.optInt("paid", 0) == 1);

        if (paid) {
          title = title + "  ·  Pagado";
        }

        views.setTextViewText(rows[i].timeId, time);
        views.setTextViewText(rows[i].titleId, title);

        if (showAddress && !TextUtils.isEmpty(address)) {
          views.setViewVisibility(rows[i].addrId, View.VISIBLE);
          views.setTextViewText(rows[i].addrId, address);
        } else {
          views.setViewVisibility(rows[i].addrId, View.GONE);
        }
      }
    }

    if (minHeight >= 140 && events.length() > 0) {
      views.setViewVisibility(R.id.widget_footer, View.VISIBLE);
      views.setTextViewText(R.id.widget_footer, context.getString(R.string.widget_footer_tap));
    } else {
      views.setViewVisibility(R.id.widget_footer, View.GONE);
    }
  }

  private static int resolveRowLimit(Bundle options) {
    int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;
    if (minHeight >= 220) {
      return 5;
    }
    if (minHeight >= 140) {
      return 3;
    }
    return 1;
  }

  private static boolean resolveShowAddress(Bundle options) {
    int minHeight = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 0) : 0;
    return minHeight >= 220;
  }

  private static void bindOpenAppIntent(Context context, RemoteViews views) {
    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("eventivapp://home?fromWidget=1"));
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    PendingIntent pendingIntent =
        PendingIntent.getActivity(
            context,
            911,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
  }

  private static class TextRow {
    final int timeId;
    final int titleId;
    final int addrId;

    TextRow(int timeId, int titleId, int addrId) {
      this.timeId = timeId;
      this.titleId = titleId;
      this.addrId = addrId;
    }
  }
}
