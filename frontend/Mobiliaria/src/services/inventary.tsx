import axios from "axios"
import { ADD_INVENTARY, GET_INVENTARY, REMOVE_INVENTARY, UPDATE_INVENTARY } from "./endpoints"
import { getAccessTokenAsync } from "@utils/token"

export const getInventary = async (): Promise<any> => {
    const url = `http://lb-eventivapi-879655844.us-east-1.elb.amazonaws.com${GET_INVENTARY}`
    

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
    const url = `http://lb-eventivapi-879655844.us-east-1.elb.amazonaws.com${ADD_INVENTARY}`
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
    const url = `http://lb-eventivapi-879655844.us-east-1.elb.amazonaws.com${UPDATE_INVENTARY}`
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
    const url = `http://lb-eventivapi-879655844.us-east-1.elb.amazonaws.com${REMOVE_INVENTARY}?id=${id}`
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