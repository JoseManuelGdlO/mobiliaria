import axios from "axios"
import { ACTIVE_WORKER, ADD_WORKER, EDIT_WORKER, GET_WORKERS, GET_WORKERS_EVENTS, REMOVE_WORKER } from "./endpoints"
import { getAccessTokenAsync } from "@utils/token"

export const getWorkers = async (): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${GET_WORKERS}`

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

export const getEventsDelivery = async (date: string): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${GET_WORKERS_EVENTS}?date=${date}`
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

export const addWorker = async (body: any): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${ADD_WORKER}`

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

export const editWorker = async (body: any): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${EDIT_WORKER}`

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
            return response.data.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

export const active = async (active: 0 | 1, id: number): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${ACTIVE_WORKER}?type=${active}&id=${id}`

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

export const deleteWorker = async (id: number): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${REMOVE_WORKER}?id=${id}`

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
            return response.data.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}

