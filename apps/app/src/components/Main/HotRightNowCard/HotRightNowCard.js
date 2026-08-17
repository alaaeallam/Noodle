import React, { useContext } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { useTranslation } from 'react-i18next'
import { AntDesign } from '@expo/vector-icons'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import UserContext from '../../../context/User'
import ConfigurationContext from '../../../context/Configuration'
import TextDefault from '../../Text/TextDefault/TextDefault'
import Spinner from '../../Spinner/Spinner'
import { scale } from '../../../utils/scaling'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import { profile as profileQuery, FavouriteRestaurant } from '../../../apollo/queries'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import styles from './styles'

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profileQuery}
`
const FAVOURITE_RESTAURANTS = gql`
  ${FavouriteRestaurant}
`

function HotRightNowCard({ restaurant, compact }) {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const { profile } = useContext(UserContext)

  const isFavourite = profile ? profile.favourite.includes(restaurant?._id) : false
  const [mutate, { loading: favouriteLoading }] = useMutation(ADD_FAVOURITE, {
    onCompleted: () => FlashMessage({ message: t('favouritelistUpdated') }),
    refetchQueries: [PROFILE, FAVOURITE_RESTAURANTS]
  })

  const onPressFavourite = () => {
    if (!profile) {
      FlashMessage({ message: t('loginRequired') })
      navigation.navigate('Profile')
      return
    }
    if (!favouriteLoading) mutate({ variables: { id: restaurant?._id } })
  }

  const cuisines = restaurant?.cuisines?.join(' · ')
  const rating = restaurant?.reviewData?.ratings

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles(currentTheme).card} onPress={() => navigation.navigate('Restaurant', { ...restaurant })}>
      <View style={[styles().imageWrap, compact && styles().imageWrapCompact]}>
        <Image resizeMode='cover' source={{ uri: restaurant?.image }} style={styles().image} />
        <TouchableOpacity activeOpacity={0.7} style={styles().favouriteBtn} onPress={onPressFavourite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {favouriteLoading ? <Spinner size='small' backColor='transparent' spinnerColor={currentTheme.black} /> : <AntDesign name={isFavourite ? 'heart' : 'hearto'} size={scale(15)} color={currentTheme.black} />}
        </TouchableOpacity>
      </View>
      <View style={styles().details}>
        <TextDefault H3={!compact} H4={compact} bolder uppercase numberOfLines={1} textColor={currentTheme.black}>
          {restaurant?.name}
        </TextDefault>
        {!!cuisines && (
          <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor}>
            {cuisines}
          </TextDefault>
        )}
        <View style={styles(currentTheme).tagRow}>
          <TextDefault uppercase bolder small textColor={currentTheme.primary}>
            {restaurant?.deliveryTime} {t('min')}
          </TextDefault>
          <TextDefault uppercase bolder small textColor={currentTheme.black}>
            {restaurant?.freeDelivery ? t('freeDelivery') : `${configuration.currencySymbol} ${configuration.deliveryRate}`}
          </TextDefault>
          {!!rating && (
            <TextDefault uppercase bolder small textColor={currentTheme.black}>
              ★ {rating}
            </TextDefault>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default HotRightNowCard
