import React, { useContext } from 'react'
import { View, ImageBackground, TouchableOpacity } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ConfigurationContext from '../../../context/Configuration'
import { scale } from '../../../utils/scaling'
import { fontStyles } from '../../../utils/fontStyles'
import styles from './styles'

function HomeHero({ currentTheme, address, onPressAddress, cartCount, onPressCart, storeName, featuredItem, onPressAddToBag }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const configuration = useContext(ConfigurationContext)

  const variation = featuredItem?.variations?.[0]
  const price = variation?.discounted || variation?.price

  return (
    <ImageBackground source={{ uri: featuredItem?.image }} style={[styles(currentTheme).container, { paddingTop: insets.top }]} resizeMode='cover'>
      <View style={styles(currentTheme).overlay} />
      <View style={styles(currentTheme).content}>
        <View style={styles(currentTheme).topRow}>
          <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).addressPill} onPress={onPressAddress}>
            <TextDefault uppercase bolder small style={styles(currentTheme).addressToLabel}>
              {t('to')}
            </TextDefault>
            <TextDefault uppercase bolder small numberOfLines={1} textColor={currentTheme.white} style={styles().addressText}>
              {address}
            </TextDefault>
            <Feather name='chevron-down' size={scale(14)} color={currentTheme.white} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).iconButton} onPress={() => navigation.navigate('Search')}>
            <Feather name='search' size={scale(16)} color={currentTheme.white} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={[styles(currentTheme).iconButton, styles(currentTheme).cartButton]} onPress={onPressCart}>
            <MaterialCommunityIcons name='cart-outline' size={scale(18)} color={currentTheme.white} />
            {cartCount > 0 && (
              <View style={styles(currentTheme).cartBadge}>
                <TextDefault textColor={currentTheme.black} bolder style={{ fontSize: scale(9) }} center>
                  {cartCount}
                </TextDefault>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {featuredItem && (
          <View style={styles(currentTheme).bottomContent}>
            <TextDefault uppercase bolder small textColor={currentTheme.white} style={{ letterSpacing: 1 }}>
              {t('todaysDrop')}{storeName ? ` · ${storeName}` : ''}
            </TextDefault>
            <TextDefault numberOfLines={2} textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton, fontSize: scale(30), lineHeight: scale(34), textTransform: 'uppercase' }}>
              {featuredItem.title}
            </TextDefault>
            <View style={styles(currentTheme).priceRow}>
              <TextDefault bolder textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton, fontSize: scale(18) }}>
                {configuration?.currencySymbol}
                {price}
              </TextDefault>
              <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).addToBagBtn} onPress={() => onPressAddToBag(featuredItem)}>
                <TextDefault uppercase bolder textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton }}>
                  {t('addToBag')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  )
}

export default HomeHero
