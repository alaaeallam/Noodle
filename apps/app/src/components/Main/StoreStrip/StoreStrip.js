import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

function StoreStrip({ currentTheme, storeName, distanceKm, closingTime, onPressSwitch }) {
  const { t } = useTranslation()

  return (
    <View style={styles(currentTheme).container}>
      <View style={styles(currentTheme).dot} />
      <TextDefault uppercase bolder small textColor={currentTheme.white} numberOfLines={1}>
        {storeName}
        {typeof distanceKm === 'number' ? ` · ${distanceKm.toFixed(1)} km` : ''}
      </TextDefault>
      {closingTime && (
        <TextDefault uppercase bold small textColor={currentTheme.gray500}>
          {t('till')} {closingTime}
        </TextDefault>
      )}
      <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).switchLabel} onPress={onPressSwitch}>
        <TextDefault uppercase bolder small textColor={currentTheme.primary}>
          {t('switchStore')}
        </TextDefault>
      </TouchableOpacity>
    </View>
  )
}

export default StoreStrip
