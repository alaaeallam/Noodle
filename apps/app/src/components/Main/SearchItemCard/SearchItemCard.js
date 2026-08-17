import React, { useContext } from 'react'
import { View, Image, TouchableOpacity, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import ConfigurationContext from '../../../context/Configuration'
import UserContext from '../../../context/User'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { storeSearch } from '../../../utils/recentSearch'
import styles from './styles'

function SearchItemCard({ item, orderedBefore, searchTerm }) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const { restaurant: restaurantCart, clearCart } = useContext(UserContext)

  const goToItem = async (clearFlag) => {
    if (clearFlag) await clearCart()
    navigation.navigate('ItemDetail', {
      food: item,
      addons: item.restaurantAddons,
      options: item.restaurantOptions,
      restaurant: item.restaurant,
      postAddScreen: 'Cart'
    })
  }

  const onPress = () => {
    if (searchTerm) storeSearch(searchTerm)
    if (!restaurantCart || item.restaurant === restaurantCart) {
      goToItem(item.restaurant !== restaurantCart)
    } else {
      Alert.alert(
        '',
        t('clearCartText'),
        [
          { text: t('Cancel'), style: 'cancel' },
          { text: t('okText'), onPress: () => goToItem(true) }
        ],
        { cancelable: true }
      )
    }
  }

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles(currentTheme).card} onPress={onPress}>
      <Image resizeMode='cover' source={{ uri: item?.image }} style={styles().image} />
      <View style={styles().details}>
        {orderedBefore && (
          <View style={styles(currentTheme).badge}>
            <TextDefault uppercase bolder textColor={currentTheme.white} style={styles().badgeText}>
              {t('orderedBefore')}
            </TextDefault>
          </View>
        )}
        <TextDefault numberOfLines={1} uppercase bolder textColor={currentTheme.black}>
          {item?.title}
        </TextDefault>
        {!!item?.description && (
          <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor}>
            {item.description}
          </TextDefault>
        )}
        <View style={styles(currentTheme).tagRow}>
          <TextDefault uppercase bolder small textColor={currentTheme.primary}>
            {configuration.currencySymbol} {item?.price}
          </TextDefault>
          <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor} style={styles().restaurantName}>
            {item?.restaurantName}
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default SearchItemCard
