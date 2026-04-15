package com.eventivapp.jm.delao.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ListenableWorker.Result;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.concurrent.TimeUnit;

public class EventWidgetRefreshWorker extends Worker {
  private static final String PERIODIC_WORK_NAME = "event_widget_periodic_refresh";

  public EventWidgetRefreshWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
    super(context, workerParams);
  }

  @NonNull
  @Override
  public Result doWork() {
    EventWidgetProvider.refreshAll(getApplicationContext());
    return Result.success();
  }

  public static void ensurePeriodic(Context context) {
    Constraints constraints =
        new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
    PeriodicWorkRequest request =
        new PeriodicWorkRequest.Builder(EventWidgetRefreshWorker.class, 1, TimeUnit.HOURS)
            .setConstraints(constraints)
            .build();
    WorkManager.getInstance(context)
        .enqueueUniquePeriodicWork(
            PERIODIC_WORK_NAME, ExistingPeriodicWorkPolicy.UPDATE, request);
  }

  public static void scheduleNow(Context context) {
    OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(EventWidgetRefreshWorker.class).build();
    WorkManager.getInstance(context).enqueue(request);
  }
}
