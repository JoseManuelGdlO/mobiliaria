import axios from "axios"
import { getAccessTokenAsync } from "@utils/token"
import { ADD_PAYMENTS, GET_PAYMENTS } from "./endpoints"

export const getPayments = async (): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_PAYMENTS}`

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
    const url = `http://3.218.160.237:8000${ADD_PAYMENTS}`

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