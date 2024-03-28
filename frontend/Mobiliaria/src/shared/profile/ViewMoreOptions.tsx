import React from 'react'
import Support from '@assets/images/icons/Support'
import ProfileIcon from '@assets/images/icons/ProfileIcon'
import ChartIcon from '@assets/images/icons/ChartIcon'
import { Image } from 'react-native'

export interface Option {
  name: string
  icon?: JSX.Element
  navigate?: string
  customAction?: () => void
  params?: object
  modalRef?: any
}

export const GetOptionsMenu = (): Option[] => {
  let options: Option[] = []

  options = [
    {
      name: 'Clientes',
      icon: <ProfileIcon color='#9E2EBE' />,
      navigate: 'Clientes'
    },
    {
      name: 'Seguimiento a pagos',
      icon: <Support color='#9E2EBE' />,
      navigate: 'Payments'
    },
    {
      name: 'Estadisticas',
      icon:  <Image
                style={{ width: 24, height: 24 }}
                source={require("../../assets/images/chart.png")}
              ></Image>,
      navigate: 'Charts'
    }
  ]
  return options
}
