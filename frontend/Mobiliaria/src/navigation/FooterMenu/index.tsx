import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import HomeIcon from '../../assets/images/icons/HomeIcon'
import { useTheme } from '../../hooks/useTheme'
import { NavigationScreens } from '../../interfaces/navigation'
import ProfileIcon from '../../assets/images/icons/ProfileIcon'
import { hasNotch } from 'react-native-device-info'
import HorizontalDots from '@assets/images/icons/HorizontalDots'
import ViewMore from '@screens/ViewMore'
import MenuScreens from '@navigation/MenuScreens'
import InvetaryIcon from '@assets/images/icons/inentaryIcon'
import Workers from '@screens/workers'
import Inventary from '@screens/inventary'
import Home from '@screens/home'
import BasicHeader from '@components/BasicHeader'
import PackageIcon from '@assets/images/icons/PackagesIcon'
import Packages from '@screens/packages'
import DeliveryMap from '@screens/delivery-map'
import PinIcon from '@assets/images/icons/PinIcon'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator<NavigationScreens>()

const HomeStak = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Inicio', header: () => <BasicHeader hideBackArrow title='Home' color='#9E2EBE' backgroundColor='white' /> }}
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
        options={{ title: 'Paquetes', headerShown: true, header: (props) => <BasicHeader color='#9E2EBE' hideBackArrow title='Paquetes 🎁' backgroundColor='white' /> }}
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
        options={{ title: 'Repartidores', headerShown: true, header: (props) => <BasicHeader color='#9E2EBE' hideBackArrow title='Repartidores 🎁' backgroundColor='white' /> }}
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
        options={{ title: 'Administrador de trabajadores', headerShown: true, header: (props) => <BasicHeader color='#9E2EBE' hideBackArrow title='Trabajadores 🐱‍🚀' backgroundColor='white' /> }}
        name='Workers'
        component={Workers}
      />
    </Stack.Navigator>
  )
}

const ViewMoreStack = (): JSX.Element => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ title: 'Ver más', header: () => <BasicHeader hideBackArrow title='Ver más' /> }}
        name='ViewMore'
        component={ViewMore}
      />
      {
        MenuScreens.map((s, index) => (
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

  const styles = StyleSheet.create({
    tabBarStyle: {
      backgroundColor: colors.black,
      height: Platform.select({
        ios: hasNotch() ? 82 : 66,
        android: 66
      })
    },
    icon: {
      marginTop: Platform.select({
        ios: 4,
        android: 0
      })
    },
    labelStyleInactive: {
      fontFamily: fonts.Inter.Regular,
      color: colors.gray500,
      fontSize: 10,
      textAlign: 'center',
      alignSelf: 'center',
      marginBottom: Platform.select({
        ios: hasNotch() ? 0 : 14,
        android: 18
      })
    },
    labelStyleActive: {
      fontFamily: fonts.Inter.Bold,
      fontWeight: 'bold',
      color: '#9E2EBE',
      fontSize: 10,
      textAlign: 'center',
      alignSelf: 'center',
      marginBottom: Platform.select({
        ios: hasNotch() ? 0 : 14,
        android: 18
      })
    }
  })
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.labelStyleInactive,
        tabBarLabelPosition: 'below-icon'
      }}
    >
      <Tab.Screen
        options={{
          headerShown: false,
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) =>
            <View
              sentry-label='Footer Inicio'
              style={[styles.icon]}
            >
              <HomeIcon width={24} height={24} color={focused ?  '#9E2EBE' : colors.darkBlack100} focused={focused} />
            </View>,
          tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Inicio</Text>
        }}
        name='HomeStack'
        component={HomeStak}
      />
      <Tab.Screen
        options={{
          title: 'Inventario',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <View
              sentry-label='Footer Inventario'
              style={[styles.icon]}
            >
              <InvetaryIcon width={24} height={24} color={focused ? '#9E2EBE' : colors.darkBlack100} focused={focused} />
            </View>,
          tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Inventario</Text>
        }}
        name='CatalogoCursosStack'
        component={ExploreStak}
      />
      <Tab.Screen
       options={{
         title: 'Paquetes',
         headerShown: false,
         tabBarIcon: ({ color, focused }) =>
           <View
             sentry-label='Footer Paquetes'
             style={[styles.icon]}
           >
             <PackageIcon width={24} height={24} color={focused ? '#9E2EBE' : colors.darkBlack100} focused={focused} />
           </View>,
         tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Paquetes</Text>
       }}
       name='CatalogoPaquetesStack'
       component={PackageStak}
     />
     <Tab.Screen
      options={{
        title: 'Repartidores',
        headerShown: false,
        tabBarIcon: ({ color, focused }) =>
          <View
            sentry-label='Footer Repartidores'
            style={[styles.icon]}
          >
            <PinIcon width={24} height={24} color={focused ? '#9E2EBE' : colors.darkBlack100} />
          </View>,
        tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Entregas</Text>
      }}
      name='DeliveryMapStack'
      component={DeliveryStak}
    />
      <Tab.Screen
        options={{
          title: 'Trabajadores',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <View
              sentry-label='Footer Trabajadores'
              style={[styles.icon]}
            >
              <ProfileIcon width={24} height={24} color={focused ? '#9E2EBE' : colors.darkBlack100} focused={focused} />
            </View>,
          tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Trabajadores</Text>
        }}
        name='TrabajadoresStak'
        component={WorkerStack}
      />
      <Tab.Screen
        options={{
          title: 'Ver más',
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            <View
              sentry-label='Footer Ver más'
              style={[styles.icon]}
            >
              <HorizontalDots width={20} height={20} color={focused ? '#9E2EBE' : colors.gris300} />
            </View>,
          tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Ver más</Text>
        }}
        name='ViewMoreStack'
        component={ViewMoreStack}
      />
    </Tab.Navigator>
  )
}
