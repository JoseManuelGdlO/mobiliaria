import { GET_CLIENTS } from './endpoints';
import { apiClient } from './apiClient';
import { ClientsQueryParams, IClients, PaginatedResponse } from '@interfaces/clients';

export const getClients = async (params: ClientsQueryParams = {}): Promise<PaginatedResponse<IClients>> => {
  const { data } = await apiClient.get(GET_CLIENTS, { params });
  return {
    data: data.data ?? data.items ?? [],
    items: data.items ?? data.data ?? [],
    total: data.total ?? 0,
    page: data.page ?? (params.page ?? 1),
    pageSize: data.pageSize ?? (params.pageSize ?? 20),
    hasMore: data.hasMore ?? false,
    code: data.code ?? 200,
  };
};
