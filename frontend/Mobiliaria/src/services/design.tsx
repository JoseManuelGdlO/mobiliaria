import { apiClient } from './apiClient';
import { LIVE_QUOTE, RECOMMEND_MOODBOARD } from './endpoints';

export const getMoodboardRecommendation = async (payload: any): Promise<any> => {
  const { data } = await apiClient.post(RECOMMEND_MOODBOARD, payload);
  return data;
};

export const getLiveQuote = async (payload: any): Promise<any> => {
  const { data } = await apiClient.post(LIVE_QUOTE, payload);
  return data;
};

export const saveDesignDraft = async (eventId: number, payload: any): Promise<any> => {
  const { data } = await apiClient.post(`/events/${eventId}/design-draft`, payload);
  return data;
};
