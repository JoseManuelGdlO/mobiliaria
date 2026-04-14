import { GET_REPORTS } from './endpoints';
import { apiClient } from './apiClient';
import { ReportsResponse } from '@interfaces/reports';

export const getReports = async (months: number): Promise<ReportsResponse> => {
  const { data } = await apiClient.get(GET_REPORTS, { params: { months } });
  return data.data;
};
