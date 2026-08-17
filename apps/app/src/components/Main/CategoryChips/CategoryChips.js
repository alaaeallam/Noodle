import React from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

function CategoryChips({ currentTheme, cuisines, selectedCuisine, onSelect, allLabel }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  if (!cuisines || cuisines.length === 0) return null

  const data = [{ _id: 'all', name: allLabel || t('allCategories') }, ...cuisines]

  return (
    <FlatList
      horizontal
      style={styles().list}
      data={data}
      keyExtractor={(item) => item._id}
      showsHorizontalScrollIndicator={false}
      inverted={isRTL}
      contentContainerStyle={styles(currentTheme).listContent}
      renderItem={({ item }) => {
        const isActive = item._id === 'all' ? !selectedCuisine : selectedCuisine?._id === item._id
        return (
          <TouchableOpacity activeOpacity={0.7} style={[styles(currentTheme).chip, isActive ? styles(currentTheme).chipActive : styles(currentTheme).chipInactive]} onPress={() => onSelect(item._id === 'all' ? null : item)}>
            <TextDefault uppercase small bolder textColor={isActive ? currentTheme.white : currentTheme.black}>
              {item.name}
            </TextDefault>
          </TouchableOpacity>
        )
      }}
    />
  )
}

export default CategoryChips
