import axios from "axios"
import { getAccessTokenAsync } from "@utils/token"
import { GET_CLIENTS } from "./endpoints"

export const getClients = async (): Promise<any> => {
    const url = `http://lb-eventivapi-879655844.us-east-1.elb.amazonaws.com${GET_CLIENTS}`

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