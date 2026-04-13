import { LOGIN_PATH, LOGIN_TOKEN_PATH } from './endpoints';
import { apiClient } from './apiClient';

export const login = async (email: string, password: string): Promise<any> => {
  try {
    const { data } = await apiClient.post(LOGIN_PATH, { email, password });
    return data;
  } catch (error: any) {
    console.log(error?.message);
    return await Promise.reject(error);
  }
};

export const tokenUser = async (id: number, token: string): Promise<any> => {
  try {
    const { data } = await apiClient.post(LOGIN_TOKEN_PATH, { token, id });
    return data;
  } catch (error: any) {
    console.log(error?.message);
    return await Promise.reject(error);
  }
};
