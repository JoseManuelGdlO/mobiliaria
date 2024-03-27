import axios from "axios"
import { LOGIN_PATH } from "./endpoints"

export const login = async (email: string, password: string): Promise<any> => {
    const url = `http://3.218.160.237:8000${LOGIN_PATH}`
    console.log(url);
    console.log(email, password);
    
    

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