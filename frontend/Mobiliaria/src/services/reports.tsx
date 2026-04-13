import { GET_REPORTS } from './endpoints';
import { apiClient } from './apiClient';

export const getReports = async (months: number): Promise<any> => {
  const { data } = await apiClient.get(GET_REPORTS, { params: { months } });
  return data.data;
};
