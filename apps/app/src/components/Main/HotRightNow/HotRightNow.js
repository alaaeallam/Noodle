import React, { useContext } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import HotRightNowCard from '../HotRightNowCard/HotRightNowCard'
import MainLoadingUI from '../LoadingUI/MainLoadingUI'
import styles from './styles'

function HotRightNow({ restaurants, loading }) {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  if (loading) return <MainLoadingUI />
  if (!restaurants || restaurants.length === 0) return null

  return (
    <View style={styles().section}>
      <View style={styles(currentTheme).header}>
        <TextDefault H3 bolder textColor={currentTheme.black}>
          {t('hotRightNow')}
        </TextDefault>
      </View>
      <View style={styles().list}>
        {restaurants.map((restaurant) => (
          <HotRightNowCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </View>
    </View>
  )
}

export default HotRightNow
