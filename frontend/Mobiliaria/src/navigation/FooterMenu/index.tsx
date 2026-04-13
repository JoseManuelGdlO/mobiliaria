import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
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

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator<NavigationScreens>()

const TAB_ICON_SIZE = 26

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name']

const FooterTabIcon = ({
  outline,
  filled,
  focused,
  activeColor,
  inactiveColor
}: {
  outline: MciName
  filled: MciName
  focused: boolean
  activeColor: string
  inactiveColor: string
}): JSX.Element => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: focused ? `${activeColor}40` : 'transparent'
    }}
  >
    <MaterialCommunityIcons
      name={focused ? filled : outline}
      size={TAB_ICON_SIZE}
      color={focused ? activeColor : inactiveColor}
    />
  </View>
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

  const styles = useMemo(() => StyleSheet.create({
    tabBarStyle: {
      backgroundColor: colors.background_parts.footer,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.Morado100}28`,
      paddingTop: 6,
      height: Platform.select({
        ios: hasNotch() ? 86 : 70,
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
        ios: hasNotch() ? 2 : 12,
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
        ios: hasNotch() ? 2 : 12,
        android: 14
      })
    }
  }), [colors, fonts])
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
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
            <View sentry-label='Footer Inicio'>
              <FooterTabIcon
                outline='home-outline'
                filled='home'
                focused={focused}
                activeColor={colors.icon.footerActive}
                inactiveColor={colors.icon.footerNoActive}
              />
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
          tabBarIcon: ({ focused }) =>
            <View sentry-label='Footer Inventario'>
              <FooterTabIcon
                outline='cube-outline'
                filled='cube'
                focused={focused}
                activeColor={colors.icon.footerActive}
                inactiveColor={colors.icon.footerNoActive}
              />
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
         tabBarIcon: ({ focused }) =>
           <View sentry-label='Footer Paquetes'>
             <FooterTabIcon
               outline='gift-outline'
               filled='gift'
               focused={focused}
               activeColor={colors.icon.footerActive}
               inactiveColor={colors.icon.footerNoActive}
             />
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
        tabBarIcon: ({ focused }) =>
          <View sentry-label='Footer Repartidores'>
            <FooterTabIcon
              outline='truck-delivery-outline'
              filled='truck-delivery'
              focused={focused}
              activeColor={colors.icon.footerActive}
              inactiveColor={colors.icon.footerNoActive}
            />
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
          tabBarIcon: ({ focused }) =>
            <View sentry-label='Footer Trabajadores'>
              <FooterTabIcon
                outline='account-group-outline'
                filled='account-group'
                focused={focused}
                activeColor={colors.icon.footerActive}
                inactiveColor={colors.icon.footerNoActive}
              />
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
          tabBarIcon: ({ focused }) =>
            <View sentry-label='Footer Ver más'>
              <FooterTabIcon
                outline='view-grid-outline'
                filled='view-grid'
                focused={focused}
                activeColor={colors.icon.footerActive}
                inactiveColor={colors.icon.footerNoActive}
              />
            </View>,
          tabBarLabel: ({ focused }) => <Text style={focused ? styles.labelStyleActive : styles.labelStyleInactive}>Ver más</Text>
        }}
        name='ViewMoreStack'
        component={ViewMoreStack}
      />
    </Tab.Navigator>
  )
}
