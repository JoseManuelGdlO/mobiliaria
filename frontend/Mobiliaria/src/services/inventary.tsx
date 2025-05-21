import axios from "axios"
import { ADD_INVENTARY, GET_INVENTARY, REMOVE_INVENTARY, UPDATE_INVENTARY } from "./endpoints"
import { getAccessTokenAsync } from "@utils/token"
import { initRemoteConfig } from "@utils/remote-config"

export const getInventary = async (): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${GET_INVENTARY}`
    

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

export const addInventary = async (body: any): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${ADD_INVENTARY}`
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


export const updateInventary = async (body: any): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${UPDATE_INVENTARY}`
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

export const remove = async (id: number): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${REMOVE_INVENTARY}?id=${id}`
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