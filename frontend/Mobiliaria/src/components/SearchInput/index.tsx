import React from 'react'
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useTheme } from '@hooks/useTheme'

interface SearchInputProps {
  value: string
  placeholder?: string
  onChangeText: (value: string) => void
}

const SearchInput = ({ value, placeholder = 'Buscar...', onChangeText }: SearchInputProps): JSX.Element => {
  const { colors, fonts } = useTheme()
  return (
    <View style={[styles.wrap, { borderColor: `${colors.Griss50}22`, backgroundColor: `${colors.white}08` }]}>
      <MaterialCommunityIcons name="magnify" size={20} color={colors.gris300} />
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        placeholderTextColor={colors.gris400}
        style={[styles.input, { color: colors.Griss50, fontFamily: fonts.Inter.Regular }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="close-circle" size={18} color={colors.gris300} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
})

export default SearchInput
