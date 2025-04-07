import { getAccessTokenAsync } from "@utils/token"
import axios from "axios"
import { GET_REPORTS } from "./endpoints"

export const getReports = async (months: number): Promise<any> => {
    const url = `https://mobiliaria.onrender.com${GET_REPORTS}?months=${months}`

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