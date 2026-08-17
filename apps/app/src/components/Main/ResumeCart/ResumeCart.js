import React, { useContext, useMemo } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import UserContext from '../../../context/User'
import ConfigurationContext from '../../../context/Configuration'
import { useRestaurant } from '../../../ui/hooks'
import { fontStyles } from '../../../utils/fontStyles'
import styles from './styles'

// "Still in your bag" — only renders once there's a real, non-empty cart.
// Needs the cart's own restaurant (not necessarily the Home screen's
// "current store") to match cart line items against live food/variation
// data for an accurate subtotal, same matching Cart.js does.
function ResumeCart({ currentTheme }) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const configuration = useContext(ConfigurationContext)
  const { cart, cartCount, restaurant: cartRestaurantId } = useContext(UserContext)
  const { data } = useRestaurant(cartRestaurantId)
  const restaurant = data?.restaurant

  const { subtotal, firstImage } = useMemo(() => {
    if (!restaurant || !cart?.length) return { subtotal: 0, firstImage: null }
    const foods = restaurant.categories?.flatMap((c) => c.foods || []) || []
    let total = 0
    let image = null
    for (const cartItem of cart) {
      const food = foods.find((f) => f._id === cartItem._id)
      if (!food) continue
      if (!image) image = food.image
      const variation = food.variations?.find((v) => v._id === cartItem.variation?._id)
      if (!variation) continue
      total += (variation.discounted || variation.price) * cartItem.quantity
    }
    return { subtotal: total, firstImage: image }
  }, [restaurant, cart])

  if (!cartCount) return null

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles(currentTheme).card} onPress={() => navigation.navigate('Cart')}>
      {firstImage ? <Image resizeMode='cover' source={{ uri: firstImage }} style={styles().image} /> : <View style={[styles().image, { backgroundColor: currentTheme.themeBackground }]} />}
      <View style={styles(currentTheme).details}>
        <TextDefault uppercase bolder small textColor={currentTheme.fontSecondColor} style={{ letterSpacing: 1 }}>
          {t('stillInYourBag')}
        </TextDefault>
        <TextDefault uppercase bolder numberOfLines={1} textColor={currentTheme.black}>
          {cartCount} {cartCount === 1 ? t('item') : t('items')} · {configuration?.currencySymbol}
          {subtotal.toFixed(0)}
        </TextDefault>
      </View>
      <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).resumeBtn} onPress={() => navigation.navigate('Cart')}>
        <TextDefault uppercase bolder textColor={currentTheme.white} small style={{ fontFamily: fontStyles.Anton }}>
          {t('resume')}
        </TextDefault>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default ResumeCart
