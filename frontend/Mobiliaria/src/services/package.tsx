import { ADD_PACKAGES, GET_PACKAGES, REMOVE_PACKAGES } from './endpoints';
import { apiClient } from './apiClient';

export const getPackages = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_PACKAGES);
  return data;
};

export const removePackage = async (id: number): Promise<any> => {
  const { data } = await apiClient.delete(REMOVE_PACKAGES, { params: { id } });
  return data;
};

export const addPackage = async (body: any): Promise<any> => {
  const { data } = await apiClient.post(ADD_PACKAGES, body);
  return data;
};
