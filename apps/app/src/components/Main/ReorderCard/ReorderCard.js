import React, { useContext } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import ConfigurationContext from '../../../context/Configuration'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

function ReorderCard({ item }) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)

  const price = item?.variation?.discounted || item?.variation?.price
  const restaurant = item?.restaurant

  const onPress = () => navigation.navigate('Restaurant', { _id: restaurant?._id, ...restaurant })

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles(currentTheme).card} onPress={onPress}>
      <Image resizeMode='cover' source={{ uri: item?.image || restaurant?.image }} style={styles().image} />
      <View style={styles().details}>
        <TextDefault numberOfLines={1} uppercase bolder textColor={currentTheme.black}>
          {item?.title}
        </TextDefault>
        <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor}>
          {restaurant?.name} · {configuration.currencySymbol}
          {price}
        </TextDefault>
        <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).reorderBtn} onPress={onPress}>
          <TextDefault uppercase bolder small textColor={currentTheme.white}>
            {t('reorder')}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default ReorderCard
