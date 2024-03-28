import BasicHeader from '@components/BasicHeader'
import Charts from '@screens/charts'
import Clients from '@screens/clients/clients'
import Payments from '@screens/payments'
import React from 'react'

export interface screen {
  name: string
  header: () => JSX.Element
  component: (props: any) => JSX.Element
  childrens?: children[]
}
export interface children {
  name: string
  header: () => JSX.Element | undefined
  component: (props: any) => JSX.Element
}

const MenuScreens: screen[] = [
  {
    name: 'Pagos',
    header: () => <BasicHeader title='Seguimiento a pagos' />,
    component: Payments
  },
  {
    name: 'Clientes',
    header: () => <BasicHeader title='Clientes' />,
    component: Clients
  },
  {
    name: 'Estadisticas',
    header: () => <BasicHeader title='Estadisticas' />,
    component: Charts
  }

]

export default MenuScreens
