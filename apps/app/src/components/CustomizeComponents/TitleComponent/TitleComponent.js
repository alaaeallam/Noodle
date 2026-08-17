import React, { useContext } from 'react'
import { View } from 'react-native'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'

function TitleComponent(props) {
  const { i18n } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = { isRTL: i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue] }

  return (
    <View style={styles(currentTheme).mainContainer}>
      <View style={styles().left}>
        <View style={styles(currentTheme).labelRow}>
          <TextDefault numberOfLines={1} uppercase bolder small textColor={currentTheme.black} isRTL>
            {props?.title}
          </TextDefault>
          {!props?.required && !!props?.status && (
            <TextDefault small textColor={currentTheme.fontSecondColor}> · {props?.status}</TextDefault>
          )}
        </View>
        {!!props?.subTitle && (
          <TextDefault numberOfLines={1} textColor={currentTheme.fontSecondColor} small isRTL>
            {props?.subTitle}
          </TextDefault>
        )}
      </View>
      {props?.required && !!props?.status && (
        <View style={styles(currentTheme).badge}>
          <TextDefault uppercase bolder textColor={currentTheme.white} style={styles().badgeText}>
            {props?.status}
          </TextDefault>
        </View>
      )}
    </View>
  )
}

export default TitleComponent
