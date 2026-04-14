import BasicHeader from '@components/BasicHeader'
import Charts from '@screens/charts'
import CRM from '@screens/crm'
import DesignEvent from '@screens/design-event'
import Expenses from '@screens/expenses'
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
    name: 'CRM',
    header: () => <BasicHeader title='Seguimiento CRM' />,
    component: CRM
  },
  {
    name: 'Estadisticas',
    header: () => <BasicHeader title='Estadísticas' />,
    component: Charts
  },
  {
    name: 'DisenaEvento',
    header: () => <BasicHeader title='Diseña tu evento' />,
    component: DesignEvent
  },
  {
    name: 'GastosFinanzas',
    header: () => <BasicHeader title='Gastos y Finanzas' />,
    component: Expenses
  }

]

export default MenuScreens
