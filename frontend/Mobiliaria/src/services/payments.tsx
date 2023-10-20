import axios from "axios"
import { getAccessTokenAsync } from "@utils/token"
import { GET_PAYMENTS } from "./endpoints"

export const getPayments = async (): Promise<any> => {
    const url = `${process.env.API_URL}${GET_PAYMENTS}`

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