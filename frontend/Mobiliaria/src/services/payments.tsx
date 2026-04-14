import { ADD_FLETE, ADD_PAYMENTS, GET_PAYMENTS } from './endpoints';
import { apiClient } from './apiClient';
import { IPayments, PaymentsQueryParams } from '@interfaces/payments';
import { PaginatedResponse } from '@interfaces/clients';

export const getPayments = async (params: PaymentsQueryParams = {}): Promise<PaginatedResponse<IPayments>> => {
  const { data } = await apiClient.get(GET_PAYMENTS, { params });
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

export const addPayment = async (body: any): Promise<any> => {
  const { data } = await apiClient.put(ADD_PAYMENTS, body);
  return data.data;
};

export const addFlete = async (body: any, id: number): Promise<any> => {
  const { data } = await apiClient.put(ADD_FLETE, body, { params: { id } });
  return data.data;
};
