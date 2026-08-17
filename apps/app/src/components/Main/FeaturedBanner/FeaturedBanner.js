import React, { useContext } from 'react'
import { View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SwiperFlatList } from 'react-native-swiper-flatlist'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ConfigurationContext from '../../../context/Configuration'
import { scale } from '../../../utils/scaling'
import { fontStyles } from '../../../utils/fontStyles'
import styles from './styles'

function FeaturedBanner({ currentTheme, storeName, featuredItems, onPressAddToBag }) {
  const { t } = useTranslation()
  const configuration = useContext(ConfigurationContext)
  const { width } = Dimensions.get('window')

  if (!featuredItems || featuredItems.length === 0) return null

  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={5}
      autoplayLoop
      showPagination={featuredItems.length > 1}
      data={featuredItems}
      paginationStyle={styles(currentTheme).pagination}
      paginationActiveColor={currentTheme.white}
      paginationDefaultColor='rgba(255,255,255,0.4)'
      paginationStyleItemActive={styles(currentTheme).paginationItemActive}
      paginationStyleItemInactive={styles(currentTheme).paginationItemInactive}
      renderItem={({ item }) => {
        const variation = item?.variations?.[0]
        const price = variation?.discounted || variation?.price
        return (
          <ImageBackground source={{ uri: item?.image }} style={[styles(currentTheme).container, { width }]} resizeMode='cover'>
            <View style={styles(currentTheme).overlay} />
            <View style={styles(currentTheme).content}>
              <View style={styles(currentTheme).bottomContent}>
                <TextDefault uppercase bolder small textColor={currentTheme.white} style={{ letterSpacing: 1 }}>
                  {t('todaysDrop')}{storeName ? ` · ${storeName}` : ''}
                </TextDefault>
                <TextDefault numberOfLines={2} textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton, fontSize: scale(30), lineHeight: scale(34), textTransform: 'uppercase' }}>
                  {item.title}
                </TextDefault>
                <View style={styles(currentTheme).priceRow}>
                  <TextDefault bolder textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton, fontSize: scale(18) }}>
                    {configuration?.currencySymbol}
                    {price}
                  </TextDefault>
                  <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).addToBagBtn} onPress={() => onPressAddToBag(item)}>
                    <TextDefault uppercase bolder textColor={currentTheme.white} style={{ fontFamily: fontStyles.Anton }}>
                      {t('addToBag')}
                    </TextDefault>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        )
      }}
    />
  )
}

export default FeaturedBanner
