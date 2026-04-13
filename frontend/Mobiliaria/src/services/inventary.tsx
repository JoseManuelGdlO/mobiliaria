import {
  ADD_INVENTARY,
  GET_INVENTARY,
  REMOVE_INVENTARY,
  UPDATE_INVENTARY,
} from './endpoints';
import { apiClient } from './apiClient';

export const getInventary = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_INVENTARY);
  return data.data;
};

export const addInventary = async (body: any): Promise<any> => {
  const { data } = await apiClient.post(ADD_INVENTARY, body);
  return data.data;
};

export const updateInventary = async (body: any): Promise<any> => {
  const { data } = await apiClient.put(UPDATE_INVENTARY, body);
  return data.data;
};

export const remove = async (id: number): Promise<any> => {
  const { data } = await apiClient.delete(REMOVE_INVENTARY, { params: { id } });
  return data.data;
};
