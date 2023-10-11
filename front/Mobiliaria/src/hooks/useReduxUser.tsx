
import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducers'

interface useReduxUserType {
    user: any
    realUser: any
    simulationActive: boolean
}

const useReduxUser = (): useReduxUserType => {
    const user = useSelector((state: RootState) => state.user)
    return {
        user: user,
        realUser: user,
        simulationActive: false
    }
}

export default useReduxUser
