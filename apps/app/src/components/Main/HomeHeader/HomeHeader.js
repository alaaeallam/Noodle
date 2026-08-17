import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { scale } from '../../../utils/scaling'
import styles from './styles'

function HomeHeader({ currentTheme, address, onPressAddress, cartCount, onPressCart }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={[styles(currentTheme).container, { paddingTop: insets.top + scale(10) }]}>
      <View style={styles(currentTheme).topRow}>
        <TouchableOpacity activeOpacity={0.7} style={styles().addressButton} onPress={onPressAddress}>
          <TextDefault uppercase small bolder textColor={currentTheme.main} style={styles().deliverToLabel}>
            {t('deliverTo')}
          </TextDefault>
          <View style={styles(currentTheme).addressRow}>
            <TextDefault H5 bolder numberOfLines={1} textColor={currentTheme.white} style={styles().addressText}>
              {address}
            </TextDefault>
            <Feather name='chevron-down' size={scale(16)} color={currentTheme.white} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).cartButton} onPress={onPressCart}>
          <MaterialCommunityIcons name='cart-outline' size={scale(22)} color={currentTheme.white} />
          {cartCount > 0 && (
            <View style={styles(currentTheme).cartBadge}>
              <TextDefault textColor={currentTheme.white} style={styles().cartBadgeText} bolder center>
                {cartCount}
              </TextDefault>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity activeOpacity={0.7} style={styles(currentTheme).searchBar} onPress={() => navigation.navigate('Search')}>
        <Ionicons name='search' size={scale(16)} color={currentTheme.gray500} />
        <TextDefault textColor={currentTheme.gray500} numberOfLines={1} style={styles().searchPlaceholder}>
          {t('searchItems')}
        </TextDefault>
      </TouchableOpacity>
    </View>
  )
}

export default HomeHeader
