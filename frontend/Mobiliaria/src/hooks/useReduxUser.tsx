
import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducers'

interface useReduxUserType {
    user: any
    token: any
    remember: boolean
}

const useReduxUser = (): useReduxUserType => {
    
    const user = useSelector((state: RootState) => state.user)
    return {
        user: user.data,
        token: user.token,
        remember: user.remember
    }
}

export default useReduxUser
