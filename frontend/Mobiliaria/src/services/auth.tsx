import axios from "axios"
import { LOGIN_PATH } from "./endpoints"

export const login = async (email: string, password: string): Promise<any> => {
    const url = `${process.env.API_URL}${LOGIN_PATH}`
    console.log(url);
    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            'content-Type': 'application/json',
        }
    })

    return await instance
        .post(url, { email, password })
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}