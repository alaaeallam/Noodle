import React, { useContext } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ConfigurationContext from '../../../context/Configuration'
import { fontStyles } from '../../../utils/fontStyles'
import styles from './styles'

function WholeMenu({ currentTheme, items, onPressItem }) {
  const { t } = useTranslation()
  const configuration = useContext(ConfigurationContext)

  if (!items || items.length === 0) return null

  return (
    <View style={styles(currentTheme).section}>
      <View style={styles(currentTheme).header}>
        <TextDefault H3 bolder textColor={currentTheme.black}>
          {t('theWholeMenu')}
        </TextDefault>
        <TextDefault uppercase bolder small textColor={currentTheme.fontSecondColor}>
          01 — {String(items.length).padStart(2, '0')}
        </TextDefault>
      </View>
      {items.map((item, index) => {
        const variation = item.variations?.[0]
        const price = variation?.discounted || variation?.price
        return (
          <TouchableOpacity key={item._id} activeOpacity={0.7} style={styles(currentTheme).row} onPress={() => onPressItem(item)}>
            <TextDefault bolder textColor={currentTheme.primary} style={[styles().index, { fontFamily: fontStyles.Anton }]}>
              {String(index + 1).padStart(2, '0')}
            </TextDefault>
            <View style={styles(currentTheme).details}>
              <TextDefault uppercase numberOfLines={1} textColor={currentTheme.black} style={{ fontFamily: fontStyles.Anton, fontSize: 19 }}>
                {item.title}
              </TextDefault>
              {!!item.description && (
                <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor}>
                  {item.description}
                </TextDefault>
              )}
            </View>
            <TextDefault bolder textColor={currentTheme.black}>
              {configuration?.currencySymbol}
              {price}
            </TextDefault>
            <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).addBtn} onPress={() => onPressItem(item)}>
              <TextDefault bolder textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton, fontSize: 18 }}>
                +
              </TextDefault>
            </TouchableOpacity>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default WholeMenu
