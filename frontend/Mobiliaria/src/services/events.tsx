import useReduxUser from "@hooks/useReduxUser"
import { GET_DETAILS_EVENT_PATH, GET_EVENTS_DAY_PATH, GET_EVENTS_PATH } from "./endpoints"
import axios from 'axios'
import { getAccessTokenAsync } from "@utils/token"

export const getEvents = async (): Promise<any> => {
    const url = `${process.env.API_URL}${GET_EVENTS_PATH}?id=1`

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
    const url = `${process.env.API_URL}${GET_EVENTS_DAY_PATH}?id=1&date=${date}`

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
    const url = `${process.env.API_URL}${GET_DETAILS_EVENT_PATH}?id=${id}`

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

            response.data.event.entregado = 1            
            return response.data.event
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}
