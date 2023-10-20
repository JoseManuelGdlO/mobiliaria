import React from 'react'
import Support from '@assets/images/icons/Support'
import ProfileIcon from '@assets/images/icons/ProfileIcon'

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
      navigate: 'Clients'
    },
    {
      name: 'Seguimiento a pagos',
      icon: <Support color='#9E2EBE' />,
      navigate: 'Payments'
    }
  ]
  return options
}
