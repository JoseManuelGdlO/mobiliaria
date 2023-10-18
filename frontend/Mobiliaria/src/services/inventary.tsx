import axios from "axios"
import { GET_INVENTARY } from "./endpoints"
import { getAccessTokenAsync } from "@utils/token"

export const getInventary = async (): Promise<any> => {
    const url = `${process.env.API_URL}${GET_INVENTARY}`

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