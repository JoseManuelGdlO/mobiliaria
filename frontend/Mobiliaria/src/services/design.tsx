import { apiClient } from './apiClient';
import { LIVE_QUOTE, RECOMMEND_MOODBOARD } from './endpoints';

export const getMoodboardRecommendation = async (payload: any): Promise<any> => {
  try {
    console.log('[DesignService] getMoodboardRecommendation:request', {
      endpoint: RECOMMEND_MOODBOARD,
      payload,
    });
    const { data } = await apiClient.post(RECOMMEND_MOODBOARD, payload);
    console.log('[DesignService] getMoodboardRecommendation:response', {
      style: data?.style?.label,
      recommendedItems: data?.recommendedItems?.length ?? 0,
    });
    return data;
  } catch (error: any) {
    console.error('[DesignService] getMoodboardRecommendation:error', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

export const getLiveQuote = async (payload: any): Promise<any> => {
  try {
    console.log('[DesignService] getLiveQuote:request', {
      endpoint: LIVE_QUOTE,
      itemCount: payload?.items?.length ?? 0,
    });
    const { data } = await apiClient.post(LIVE_QUOTE, payload);
    console.log('[DesignService] getLiveQuote:response', {
      subtotal: data?.breakdown?.subtotal,
      total: data?.breakdown?.total,
    });
    return data;
  } catch (error: any) {
    console.error('[DesignService] getLiveQuote:error', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

export const saveDesignDraft = async (eventId: number, payload: any): Promise<any> => {
  try {
    console.log('[DesignService] saveDesignDraft:request', {
      endpoint: `/events/${eventId}/design-draft`,
      eventId,
    });
    const { data } = await apiClient.post(`/events/${eventId}/design-draft`, payload);
    console.log('[DesignService] saveDesignDraft:response', { ok: true });
    return data;
  } catch (error: any) {
    console.error('[DesignService] saveDesignDraft:error', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};
