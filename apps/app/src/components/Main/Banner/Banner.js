import React, { useContext } from 'react'
import { View, ImageBackground, TouchableOpacity, Dimensions } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { SwiperFlatList } from 'react-native-swiper-flatlist'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { BANNER_PARAMETERS } from '../../../utils/banner-routes'

const Banner = ({ banners }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { width } = Dimensions.get('window')

  const onPressBanner = (banner) => {
    if (banner?.action === 'Navigate Specific Restaurant') {
      navigation.navigate('Restaurant', { _id: banner.screen })
    } else if (banner?.action === 'Navigate Search') {
      navigation.navigate('Search', { presetSearch: banner.screen })
    } else if (BANNER_PARAMETERS[banner?.screen]) {
      const { name, selectedType, queryType } = BANNER_PARAMETERS[banner.screen]
      navigation.navigate(name, {
        selectedType: selectedType ?? 'restaurant',
        queryType: queryType ?? 'restaurant'
      })
    } else {
      navigation.navigate('Search')
    }
  }

  if (!banners || banners.length === 0) return null

  return (
    <View style={styles().wrapper}>
      <SwiperFlatList
        autoplay
        autoplayDelay={4}
        autoplayLoop
        showPagination
        data={banners}
        paginationStyle={styles().pagination}
        paginationActiveColor={currentTheme.black}
        paginationDefaultColor={currentTheme.gray200}
        paginationStyleItemActive={styles().paginationItemActive}
        paginationStyleItemInactive={styles().paginationItemInactive}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.85} style={[styles(currentTheme).banner, { width: width - 32 }]} onPress={() => onPressBanner(item)}>
            <View style={styles().textCol}>
              {!!item?.description && (
                <TextDefault uppercase bolder small textColor='rgba(255,255,255,0.85)' style={styles().eyebrow}>
                  {item.description}
                </TextDefault>
              )}
              <TextDefault H3 bolder textColor={currentTheme.white} numberOfLines={2}>
                {item?.title}
              </TextDefault>
              <View style={styles(currentTheme).cta}>
                <TextDefault uppercase bolder small textColor={currentTheme.white}>
                  {t('shopNow')}
                </TextDefault>
              </View>
            </View>
            <ImageBackground source={{ uri: item?.file }} style={styles().image} resizeMode='cover' />
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default Banner
