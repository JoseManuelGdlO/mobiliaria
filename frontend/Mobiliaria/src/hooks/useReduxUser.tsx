
import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducers'
import { IUser } from '@interfaces/user'

interface useReduxUserType {
    user: IUser
    token: any
    remember: boolean
}

const useReduxUser = (): useReduxUserType => {
    
    const user = useSelector((state: RootState) => state.user)
    return {
        user: user.data as IUser,
        token: user.token,
        remember: user.remember
    }
}

export default useReduxUser
