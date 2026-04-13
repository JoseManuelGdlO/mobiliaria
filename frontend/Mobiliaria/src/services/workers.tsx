import {
  ACTIVE_WORKER,
  ADD_WORKER,
  EDIT_WORKER,
  GET_WORKERS,
  GET_WORKERS_EVENTS,
  REMOVE_WORKER,
} from './endpoints';
import { apiClient } from './apiClient';

export const getWorkers = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_WORKERS);
  return data.data;
};

export const getEventsDelivery = async (date: string): Promise<any> => {
  const { data } = await apiClient.get(GET_WORKERS_EVENTS, { params: { date } });
  return data.data;
};

export const addWorker = async (body: any): Promise<any> => {
  const { data } = await apiClient.post(ADD_WORKER, body);
  return data.data;
};

export const editWorker = async (body: any): Promise<any> => {
  const { data } = await apiClient.put(EDIT_WORKER, body);
  return data.data;
};

export const active = async (active: 0 | 1, id: number): Promise<any> => {
  const { data } = await apiClient.put(ACTIVE_WORKER, {}, {
    params: { type: active, id },
  });
  return data.data;
};

export const deleteWorker = async (id: number): Promise<any> => {
  const { data } = await apiClient.delete(REMOVE_WORKER, { params: { id } });
  return data.data;
};
