


import { useSelector } from 'react-redux'
import { RootState } from '../redux/reducers'
import { IUser } from '@interfaces/user'
import { IAvailability } from '@interfaces/availability'
import { IPackage } from '@interfaces/packages'

interface useReduxEventType {
    inventaryRx: IAvailability[],
    packagesRx: IPackage[],
    eventRx: any,
    totalRx: number
}

const useReduxEvent = (): useReduxEventType => {

    const event = useSelector((state: RootState) => state.event)
    return {
        inventaryRx: event.inventary,
        eventRx: event.event,
        totalRx: event.total,
        packagesRx: event.packages
    }
}

export default useReduxEvent