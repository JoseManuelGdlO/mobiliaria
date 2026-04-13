export const designAnalyticsEvents = {
  flowOpened: 'design_flow_opened',
  recommendationRequested: 'design_recommendation_requested',
  recommendationSucceeded: 'design_recommendation_succeeded',
  liveQuoteGenerated: 'live_quote_generated',
  draftSaved: 'design_draft_saved',
  flowAbandoned: 'design_flow_abandoned',
} as const;

export const trackDesignEvent = (
  event: (typeof designAnalyticsEvents)[keyof typeof designAnalyticsEvents],
  payload: Record<string, unknown> = {}
): void => {
  // Hook central para reemplazar con proveedor analítico (Mixpanel, Firebase, etc).
  console.log('[analytics:design]', event, payload);
};
