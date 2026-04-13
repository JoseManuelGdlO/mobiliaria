/* eslint-disable  @typescript-eslint/strict-boolean-expressions */
import { View, FlatList, Text } from 'react-native'
import React from 'react'
import ViewMoreItem from '@components/ViewMore/ViewMoreItem'
import CloseSessionButton from '@components/ViewMore/CloseSessionButton'
import { useViewMoreMenuOptions } from '@shared/profile/ViewMoreOptions'
import { useTheme } from '@hooks/useTheme'
import useReduxUser from '@hooks/useReduxUser'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export interface Option {
  name: string
  icon?: JSX.Element
  navigate?: string
  customAction?: () => void
  params?: object
  modalRef?: any
}

const ViewMore = (): JSX.Element => {
  const { colors, fonts } = useTheme()
  const { user } = useReduxUser()
  const options: Option[] = useViewMoreMenuOptions()
  const renderItem = ({ item }: { item: Option }): JSX.Element => <ViewMoreItem {...item} />
  const keyExtractor = (item: Option, index: number): string => index.toString()
  const listHeader = (): JSX.Element => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
      <View
        style={{
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: `${colors.Morado100}33`,
          backgroundColor: `${colors.white}0A`,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${colors.Morado600}44`,
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons name="account-outline" size={24} color={colors.Morado100} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.Inter.SemiBold, fontSize: 16, color: colors.Griss50 }}>
            {user?.nombre_comp ?? 'Usuario'}
          </Text>
          <Text style={{ fontFamily: fonts.Inter.Regular, fontSize: 12, color: colors.gris300, marginTop: 2 }}>
            {user?.correo ?? 'Sin correo'}
          </Text>
        </View>
      </View>
      <Text style={{ fontFamily: fonts.Inter.Medium, fontSize: 13, color: colors.gris300, marginTop: 12, marginLeft: 2 }}>
        Menú
      </Text>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.DarkViolet300 }}>
      <FlatList
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
        ListHeaderComponent={listHeader}
        data={options}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={<CloseSessionButton />}
      />
    </View>
  )
}

export default ViewMore
