import axios from "axios"
import { GET_WORKERS } from "./endpoints"
import { getAccessTokenAsync } from "@utils/token"

export const getWorkers = async (): Promise<any> => {
    const url = `${process.env.API_URL}${GET_WORKERS}`

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