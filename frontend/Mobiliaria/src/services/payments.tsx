import axios from "axios"
import { getAccessTokenAsync } from "@utils/token"
import { ADD_FLETE, ADD_PAYMENTS, GET_PAYMENTS } from "./endpoints"
import { initRemoteConfig } from "@utils/remote-config"

export const getPayments = async (): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${GET_PAYMENTS}`

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

export const addPayment = async (body: any): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${ADD_PAYMENTS}`

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

export const addFlete = async (body: any, id: number): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${ADD_FLETE}?id=${id}`

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