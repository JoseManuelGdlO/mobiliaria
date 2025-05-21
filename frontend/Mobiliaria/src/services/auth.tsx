import axios from "axios"
import { LOGIN_PATH, LOGIN_TOKEN_PATH } from "./endpoints"
import { initRemoteConfig } from "@utils/remote-config";

export const login = async (email: string, password: string): Promise<any> => {
    const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    console.log('API_URL', API_URL);
    
    const url = `${API_URL}${LOGIN_PATH}`
    const instance = axios.create({
        baseURL: url,
        data: {
            email,
            password
        },
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        
    })

    return await instance
        .post(url, { email, password })
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            console.log(error.message);
            
            return await Promise.reject(error)
        })
}

export const tokenUser = async (id: number, token: string): Promise<any> => {
    const API_URL = await initRemoteConfig(); // obtiene desde Firebase
    const url = `${API_URL}${LOGIN_TOKEN_PATH}`

    const instance = axios.create({
        baseURL: url,
        data: {token, id},
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        
    })

    return await instance
        .post(url,  {token, id})
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            console.log(error.message);
            
            return await Promise.reject(error)
        })
}