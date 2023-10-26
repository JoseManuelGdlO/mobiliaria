


import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducers'
import { IUser } from '@interfaces/user'
import { IAvailability } from '@interfaces/availability'

interface useReduxEventType {
    inventaryRx: IAvailability[],
    eventRx: any,
    totalRx: number
}

const useReduxEvent = (): useReduxEventType => {

    const event = useSelector((state: RootState) => state.event)
    return {
        inventaryRx: event.inventary,
        eventRx: event.event,
        totalRx: event.total
    }
}

export default useReduxEvent