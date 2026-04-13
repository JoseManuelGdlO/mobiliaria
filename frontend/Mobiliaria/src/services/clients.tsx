import { GET_CLIENTS } from './endpoints';
import { apiClient } from './apiClient';

export const getClients = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_CLIENTS);
  return data.data;
};
