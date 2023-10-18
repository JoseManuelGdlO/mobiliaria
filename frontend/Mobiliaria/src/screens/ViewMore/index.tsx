/* eslint-disable  @typescript-eslint/strict-boolean-expressions */
import { View, FlatList } from 'react-native'
import React from 'react'
import ViewMoreItem from '@components/ViewMore/ViewMoreItem'
import CloseSessionButton from '@components/ViewMore/CloseSessionButton'
import { GetOptionsMenu } from '@shared/profile/ViewMoreOptions'
import useReduxUser from '@hooks/useReduxUser'

export interface Option {
  name: string
  icon?: JSX.Element
  navigate?: string
  customAction?: () => void
  params?: object
  modalRef?: any
}

const ViewMore = (): JSX.Element => {
  const { user } = useReduxUser()
  const renderItem = ({ item }: { item: Option }): JSX.Element => <ViewMoreItem {...item} />
  const keyExtractor = (item: Option, index: number): string => index.toString()

  const options: Option[] = GetOptionsMenu()

  return (
    <View>
      <FlatList
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        data={options}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={<CloseSessionButton />}
      />
    </View>
  )
}

export default ViewMore
