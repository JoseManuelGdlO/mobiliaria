import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@hooks/useTheme'

export interface FilterChipOption {
  id: string
  label: string
}

interface FilterChipsProps {
  options: FilterChipOption[]
  selected: string
  onSelect: (id: string) => void
}

const FilterChips = ({ options, selected, onSelect }: FilterChipsProps): JSX.Element => {
  const { colors, fonts } = useTheme()
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.id === selected
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.chip,
              {
                borderColor: active ? colors.Morado100 : `${colors.Griss50}25`,
                backgroundColor: active ? `${colors.Morado600}33` : `${colors.white}06`,
              },
            ]}
          >
            <Text style={{ color: active ? colors.Morado100 : colors.gris300, fontFamily: fonts.Inter.Medium, fontSize: 12 }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
})

export default FilterChips
