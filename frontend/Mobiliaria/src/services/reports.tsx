import { getAccessTokenAsync } from "@utils/token"
import axios from "axios"
import { GET_REPORTS } from "./endpoints"
import { initRemoteConfig } from "@utils/remote-config"

export const getReports = async (months: number): Promise<any> => {
        const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${GET_REPORTS}?months=${months}`

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