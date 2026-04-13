import {
  ADD_DIRECTIONS_EVENT_PATH,
  ADD_ITEMS,
  ADD_OBS,
  CREATE_EVENT,
  EDIT_EVENT,
  GET_AVAILABLE_DAY_PATH,
  GET_DETAILS_EVENT_PATH,
  GET_EVENTS_DAY_PATH,
  GET_EVENTS_PATH,
  REMOVE_EVENT,
  REMOVE_ITEM,
  STATUS_DELIVERY,
} from './endpoints';
import { IAvailability } from '@interfaces/availability';
import { formatDateString } from '@utils/dateFormat';
import { apiClient } from './apiClient';

export const getEvents = async (): Promise<any> => {
  const { data } = await apiClient.get(GET_EVENTS_PATH, { params: { id: 1 } });
  return data;
};

export const getEventsDay = async (date: string): Promise<any> => {
  const { data } = await apiClient.get(GET_EVENTS_DAY_PATH, {
    params: { id: 1, date },
  });
  return data;
};

export const addDirection = async (id: number, body: any): Promise<any> => {
  const { data } = await apiClient.put(ADD_DIRECTIONS_EVENT_PATH, body, {
    params: { id },
  });
  return data.event;
};

export const getEventDetail = async (id: number): Promise<any> => {
  const { data } = await apiClient.get(GET_DETAILS_EVENT_PATH, {
    params: { id },
  });
  return data.event;
};

export const getAvailableDay = async (date: string): Promise<any> => {
  const { data } = await apiClient.get(GET_AVAILABLE_DAY_PATH, {
    params: { date },
  });
  return data.data;
};

export const addEvent = async (body: any): Promise<any> => {
  const { data } = await apiClient.post(CREATE_EVENT, body);
  return data.data;
};

export const addRecurrentEvent = async (
  body: any,
  recTime: number,
  weekDays: any[],
  firstDate: Date,
  paymentFlag: boolean
): Promise<any> => {
  const result: Date[] = [];
  const currentMonth = firstDate.getMonth();
  const currentYear = firstDate.getFullYear();
  const startDay = firstDate.getDate();
  for (let i = 0; i < recTime; i++) {
    const month = currentMonth + i;
    const year = currentYear + Math.floor(month / 12);
    const adjustedMonth = month % 12;

    const daysInMonth = new Date(year, adjustedMonth + 1, 0).getDate();

    const dayStart = i === 0 ? startDay + 1 : 1;

    for (let day = dayStart; day <= daysInMonth; day++) {
      const date = new Date(year, adjustedMonth, day);
      if (weekDays.includes(date.getDay())) {
        result.push(date);
      }
    }
  }

  body.evento.nombre_evento = `${body.evento.nombre_evento} (recurrente)`;
  body.evento.nombre_titular_evento = `${body.evento.nombre_titular_evento} (evento recurrente)`;
  for (const date of result) {
    const newDate = formatDateString(date.toString());
    body.evento.fecha_envio_evento = newDate;
    body.evento.fecha_recoleccion_evento = newDate;
    body.rec = true;
    if (!paymentFlag) {
      body.evento.pago = 0;
      body.costo.anticipo = 0;
      body.costo.saldo = body.costo.costo_total;
    }

    body.mobiliario.forEach((mob: any) => {
      mob.fecha_evento = newDate;
      mob.fecha_recoleccion = newDate;
    });
    await addEvent(body);
  }
};

export const addObservation = async (obs: string, id: number): Promise<any> => {
  const body = { id, observaciones: obs };
  const { data } = await apiClient.put(ADD_OBS, body);
  return data.data;
};

export const changeStatus = async (
  id: number,
  delivered: number,
  recolected: number
): Promise<any> => {
  const { data } = await apiClient.put(STATUS_DELIVERY, {}, {
    params: { id, delivered, recolected },
  });
  return data.data;
};

export const addItemsToEvent = async (
  id: number,
  items: IAvailability[]
): Promise<any> => {
  const body = { id, items };
  return apiClient.post(ADD_ITEMS, body);
};

export const removeEvent = async (id: number): Promise<any> => {
  return apiClient.delete(REMOVE_EVENT, { params: { id } });
};

export const removeItem = async (id: number, id_mob: number): Promise<any> => {
  return apiClient.delete(REMOVE_ITEM, { params: { id, id_mob } });
};

export const editEvent = async (
  id: number,
  titular: string,
  telefono: string,
  direccion: string
): Promise<any> => {
  const body = { id, titular, telefono, direccion };
  return apiClient.post(EDIT_EVENT, body);
};
