import axios from "axios"
import { LOGIN_PATH } from "./endpoints"

export const login = async (email: string, password: string): Promise<any> => {
    const url = `http://192.168.0.21:8000${LOGIN_PATH}`
    console.log(url);
    console.log(email, password);
    
    

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
            console.log(error);
            
            return await Promise.reject(error)
        })
}