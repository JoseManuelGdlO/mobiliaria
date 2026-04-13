import { ADD_FLETE, ADD_PAYMENTS, GET_PAYMENTS } from './endpoints';
import { apiClient } from './apiClient';

export const getPayments = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_PAYMENTS);
  return data.data;
};

export const addPayment = async (body: any): Promise<any> => {
  const { data } = await apiClient.put(ADD_PAYMENTS, body);
  return data.data;
};

export const addFlete = async (body: any, id: number): Promise<any> => {
  const { data } = await apiClient.put(ADD_FLETE, body, { params: { id } });
  return data.data;
};
