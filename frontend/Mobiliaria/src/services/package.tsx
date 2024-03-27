import axios from "axios"
import { ADD_PACKAGES, GET_PACKAGES, REMOVE_PACKAGES } from "./endpoints"
import { IPackage } from "@interfaces/packages";
import { getAccessTokenAsync } from "@utils/token";

export const getPackages = async (): Promise<any> => {
    const url = `http://3.218.160.237:8000${GET_PACKAGES}`

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
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}


export const removePackage = async (id: number): Promise<any> => {
    const url = `http://3.218.160.237:8000${REMOVE_PACKAGES}?id=${id}`
    console.log(url);    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })

    return await instance
        .delete(url)
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}



export const addPackage = async (body: any): Promise<any> => {
    const url = `http://3.218.160.237:8000${ADD_PACKAGES}`
    console.log(url);    

    const instance = axios.create({
        baseURL: url,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${await getAccessTokenAsync()}`,
            'content-Type': 'application/json',
        }
    })
    console.log(body);
    

    return await instance
        .post(url, body)
        .then(async response => {
            return response.data
        })
        .catch(async error => {
            return await Promise.reject(error)
        })
}