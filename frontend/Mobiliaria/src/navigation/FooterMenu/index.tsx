import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useTheme } from '../../hooks/useTheme'
import { NavigationScreens } from '../../interfaces/navigation'
import { hasNotch } from 'react-native-device-info'
import ViewMore from '@screens/ViewMore'
import MenuScreens from '@navigation/MenuScreens'
import Workers from '@screens/workers'
import Inventary from '@screens/inventary'
import Home from '@screens/home'
import BasicHeader from '@components/BasicHeader'
import Packages from '@screens/packages'
import DeliveryMap from '@screens/delivery-map'
import useReduxUser from '@hooks/useReduxUser'
import { canAccess } from '@utils/permissions'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator<NavigationScreens>()

const TAB_ICON_SIZE = 24

type IonName = React.ComponentProps<typeof Ionicons>['name']

const FooterTabIcon = ({
  outline,
  filled,
  focused,
  activeColor,
  inactiveColor
}: {
  outline: IonName
  filled: IonName
  focused: boolean
  activeColor: string
  inactiveColor: string
}): JSX.Element => (
  <Ionicons
    name={focused ? filled : outline}
    size={TAB_ICON_SIZE}
    color={focused ? activeColor : inactiveColor}
  />
)

const HomeStak = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Inicio', header: () => <BasicHeader hideBackArrow title='Home' /> }}
        name='Home'
        component={Home}
      />
    </Stack.Navigator>
  )
}

const ExploreStak = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Inventario', headerShown: false }}
        name='Inventary'
        component={Inventary}
      />
    </Stack.Navigator>
  )
}


const PackageStak = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Paquetes', headerShown: true, header: () => <BasicHeader hideBackArrow title='Paquetes' /> }}
        name='Package'
        component={Packages}
      />
    </Stack.Navigator>
  )
}

const DeliveryStak = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Repartidores', headerShown: true, header: () => <BasicHeader hideBackArrow title='Repartidores' /> }}
        name='Delivery'
        component={DeliveryMap}
      />
    </Stack.Navigator>
  )
}


const WorkerStack = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Administrador de trabajadores', headerShown: true, header: () => <BasicHeader hideBackArrow title='Trabajadores' /> }}
        name='Workers'
        component={Workers}
      />
    </Stack.Navigator>
  )
}

const ViewMoreStack = (): JSX.Element => {
  const { user } = useReduxUser()
  const visibleMenuScreens = useMemo(
    () =>
      MenuScreens.filter((screen) => {
        if (screen.name === 'Estadisticas') return canAccess(user?.rol_usuario, 'statistics')
        if (screen.name === 'GastosFinanzas') return canAccess(user?.rol_usuario, 'finance')
        return true
      }),
    [user?.rol_usuario],
  )

  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Ver más', header: () => <BasicHeader hideBackArrow title='Ver más' /> }}
        name='ViewMore'
        component={ViewMore}
      />
      {
        visibleMenuScreens.map((s, index) => (
          <React.Fragment key={`sharedScreed-${index}`}>
            <Stack.Screen options={{ header: s.header }} name={s.name} component={s.component} />
            {
              s.childrens?.map((c, indexC) => (
                <Stack.Screen key={`sharedScreed-${index}-${indexC}`} options={{ header: c.header }} name={c.name} component={c.component} />
              ))
            }
          </React.Fragment>
        ))
      }
    </Stack.Navigator>
  )
}

export const FooterMenu = (): JSX.Element => {
  const { colors, fonts } = useTheme()
  const { user } = useReduxUser()
  const canSeeWorkers = canAccess(user?.rol_usuario, 'workers')

  const styles = useMemo(() => StyleSheet.create({
    tabBarStyle: {
      backgroundColor: colors.background_parts.footer,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.Morado100}28`,
      paddingTop: Platform.select({
        ios: 12,
        android: 6
      }),
      height: Platform.select({
        ios: hasNotch() ? 108 : 92,
        android: 72
      }),
      ...Platform.select({
        ios: {
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.14,
          shadowRadius: 8
        },
        android: { elevation: 16 }
      })
    },
    labelStyleInactive: {
      fontFamily: fonts.Inter.Medium,
      color: colors.icon.footerNoActive,
      fontSize: 11,
      letterSpacing: 0.15,
      textAlign: 'center',
      alignSelf: 'center',
      marginTop: 2,
      marginBottom: Platform.select({
        ios: hasNotch() ? 8 : 16,
        android: 14
      })
    },
    labelStyleActive: {
      fontFamily: fonts.Inter.SemiBold,
      color: colors.icon.footerActive,
      fontSize: 11,
      letterSpacing: 0.15,
      textAlign: 'center',
      alignSelf: 'center',
      marginTop: 2,
      marginBottom: Platform.select({
        ios: hasNotch() ? 8 : 16,
        android: 14
      })
    }
  }), [colors, fonts])
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
        tabBarShowIcon: true,
        tabBarActiveTintColor: colors.icon.footerActive,
        tabBarInactiveTintColor: colors.icon.footerNoActive,
        tabBarLabelStyle: styles.labelStyleInactive,
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true
      }}
    >
      <Tab.Screen
        options={{
          headerShown: false,
          title: 'Inicio',
          tabBarIcon: ({ focused }) =>
            <FooterTabIcon
              outline='home-outline'
              filled='home'
              focused={focused}
              activeColor={colors.icon.footerActive}
              inactiveColor={colors.icon.footerNoActive}
            />
        }}
        name='HomeStack'
        component={HomeStak}
      />
      <Tab.Screen
        options={{
          title: 'Inventario',
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            <FooterTabIcon
              outline='cube-outline'
              filled='cube'
              focused={focused}
              activeColor={colors.icon.footerActive}
              inactiveColor={colors.icon.footerNoActive}
            />
        }}
        name='CatalogoCursosStack'
        component={ExploreStak}
      />
      <Tab.Screen
       options={{
         title: 'Paquetes',
         headerShown: false,
         tabBarIcon: ({ focused }) =>
           <FooterTabIcon
             outline='gift-outline'
             filled='gift'
             focused={focused}
             activeColor={colors.icon.footerActive}
             inactiveColor={colors.icon.footerNoActive}
           />
       }}
       name='CatalogoPaquetesStack'
       component={PackageStak}
     />
     <Tab.Screen
      options={{
        title: 'Repartidores',
        headerShown: false,
        tabBarIcon: ({ focused }) =>
          <FooterTabIcon
            outline='car-outline'
            filled='car'
            focused={focused}
            activeColor={colors.icon.footerActive}
            inactiveColor={colors.icon.footerNoActive}
          />
      }}
      name='DeliveryMapStack'
      component={DeliveryStak}
    />
      {canSeeWorkers && (
        <Tab.Screen
          options={{
            title: 'Trabajadores',
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              <FooterTabIcon
                outline='people-outline'
                filled='people'
                focused={focused}
                activeColor={colors.icon.footerActive}
                inactiveColor={colors.icon.footerNoActive}
              />
          }}
          name='TrabajadoresStak'
          component={WorkerStack}
        />
      )}
      <Tab.Screen
        options={{
          title: 'Ver más',
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            <FooterTabIcon
              outline='grid-outline'
              filled='grid'
              focused={focused}
              activeColor={colors.icon.footerActive}
              inactiveColor={colors.icon.footerNoActive}
            />
        }}
        name='ViewMoreStack'
        component={ViewMoreStack}
      />
    </Tab.Navigator>
  )
}
