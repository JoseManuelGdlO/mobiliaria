import useReduxUser from "@hooks/useReduxUser"
import { ADD_DIRECTIONS_EVENT_PATH, ADD_ITEMS, ADD_OBS, CREATE_EVENT, EDIT_EVENT, GET_AVAILABLE_DAY_PATH, GET_DETAILS_EVENT_PATH, GET_EVENTS_DAY_PATH, GET_EVENTS_PATH, REMOVE_EVENT, REMOVE_ITEM, STATUS_DELIVERY } from "./endpoints"
import axios from 'axios'
import { getAccessTokenAsync } from "@utils/token"
import { IAvailability } from "@interfaces/availability"
import { formatDateString } from "@utils/dateFormat"

export const getEvents = async (): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_EVENTS_PATH}?id=1`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .get(url)
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const getEventsDay = async (date: string): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_EVENTS_DAY_PATH}?id=1&date=${date}`
    console.log('url', url);
    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .get(url)
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const addDirection = async (id: number, body: any): Promise<any> => {
    const url = `http://3.218.160.237:8000${ADD_DIRECTIONS_EVENT_PATH}?id=${id}`
    console.log('url', url);
    
    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .put(url, body)
        .then(async response => {
            return response.data.event
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const getEventDetail = async (id: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_DETAILS_EVENT_PATH}?id=${id}`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .get(url)
        .then(async response => {
            return response.data.event
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const getAvailableDay = async (date: string): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_AVAILABLE_DAY_PATH}?date=${date}`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .get(url)
        .then(async response => {
            return response.data.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const addEvent = async (body: any): Promise<any> => {
    const url = `http://3.218.160.237:8000${CREATE_EVENT}`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .post(url, body)
        .then(async response => {
            return response.data.data
        })
        .catch(async error => {
            console.log('error', error);
            
            return await Promise.reject(error)
        })
}

export const addRecurrentEvent = async (body: any, recTime: number, weekDays: any[], firstDate: Date, paymentFlag: boolean): Promise<any> => {
    
    const result: Date[] = [];
    const currentMonth = firstDate.getMonth();
    const currentYear = firstDate.getFullYear();
    const startDay = firstDate.getDate();
    const promises = []
    
    
    for (let i = 0; i < recTime; i++) {
      const month = currentMonth + i;
      const year = currentYear + Math.floor(month / 12);
      const adjustedMonth = month % 12;

      const daysInMonth = new Date(year, adjustedMonth + 1, 0).getDate();

      const dayStart = (i === 0) ? startDay+ 1 : 1;
        
      for (let day = dayStart; day <= daysInMonth; day++) {
        
        const date = new Date(year, adjustedMonth, day);
        if (weekDays.includes(date.getDay())) {
          result.push(date);
        }
      }
    }
    
    body.evento.nombre_evento = `${body.evento.nombre_evento} (recurrente)`
    for (let date of result) {
       
        const newDate = formatDateString(date.toString())
        body.evento.fecha_envio_evento = newDate
        body.evento.fecha_recoleccion_evento = newDate
        if(!paymentFlag){
            body.evento.pago = 0
            body.costo.anticipo = 0
            body.costo.saldo = body.costo.costo_total
        }

        body.mobiliario.forEach((mob: any) => {
            mob.fecha_evento = newDate
            mob.fecha_recoleccion = newDate
        })
        console.log('body', body.evento.fecha_envio_evento);
        await addEvent(body)
    }
    

}



export const addObservation = async (obs: string, id: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${ADD_OBS}`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    const body = {
        id,
        observaciones: obs
    }

    return await instance
        .put(url, body)
        .then(async response => {
            return response.data.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const changeStatus = async (id: number, delivered: number, recolected: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${STATUS_DELIVERY}?id=${id}&delivered=${delivered}&recolected=${recolected}`

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .put(url)
        .then(async response => {
            return response.data.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const addItemsToEvent = async (id: number, items: IAvailability[]): Promise<any> => {
    const url = `http://3.218.160.237:8000${ADD_ITEMS}`
    const body = {
        id,
        items
    }
    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .post(url, body)
        .then(async response => {
            return response
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const removeEvent = async (id: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${REMOVE_EVENT}?id=${id}`


    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .delete(url)
        .then(async response => {
            console.log('response', response);
            
            return response
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const removeItem = async (id: number, id_mob: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${REMOVE_ITEM}?id=${id}&id_mob=${id_mob}`

    
    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .delete(url)
        .then(response => {

            return response
        })
        .catch(async error => {
            console.log('error', error);
            
            return await Promise.reject(error)
        })

}

export const editEvent = async (id: number, titular:string, telefono: string, direccion: string): Promise<any> => {
    const url = `http://3.218.160.237:8000${EDIT_EVENT}`
    const body = {
        id,
        titular,
        telefono,
        direccion
    }    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .post(url, body)
        .then(async response => {
            return response
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
    }
