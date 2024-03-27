import useReduxUser from "@hooks/useReduxUser"
import { ADD_ITEMS, ADD_OBS, CREATE_EVENT, GET_AVAILABLE_DAY_PATH, GET_DETAILS_EVENT_PATH, GET_EVENTS_DAY_PATH, GET_EVENTS_PATH, REMOVE_EVENT, REMOVE_ITEM, STATUS_DELIVERY } from "./endpoints"
import axios from 'axios'
import { getAccessTokenAsync } from "@utils/token"
import { IAvailability } from "@interfaces/availability"

export const getEvents = async (): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_EVENTS_PATH}?id=1`
    console.log(url);

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
    console.log(url);

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

export const getEventDetail = async (id: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_DETAILS_EVENT_PATH}?id=${id}`
    console.log(url);

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
    console.log(url);

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
    console.log(url);

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
            return await Promise.reject(error)
        })
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
    console.log(url);
    

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
            console.log(response);

            return response
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const removeItem = async (id: number, id_mob: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${REMOVE_ITEM}?id=${id}&id_mob=${id_mob}`
    console.log(url);

    
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
            console.log('respuesta', response);

            return response
        })
        .catch(async error => {
            console.log('error', error);
            
            return await Promise.reject(error)
        })

}
