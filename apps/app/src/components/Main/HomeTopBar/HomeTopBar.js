import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { scale } from '../../../utils/scaling'
import styles from './styles'

function HomeTopBar({ currentTheme, address, onPressAddress, cartCount, onPressCart }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={[styles(currentTheme).container, { paddingTop: insets.top + scale(10) }]}>
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
    </View>
  )
}

export default HomeTopBar
