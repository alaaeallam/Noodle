import React, { useContext, useMemo } from 'react'
import { View, FlatList, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import OrdersContext from '../../../context/Orders'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ReorderCard from '../ReorderCard/ReorderCard'
import MainLoadingUI from '../LoadingUI/MainLoadingUI'
import styles from './styles'

function ReorderRail() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { orders, loadingOrders } = useContext(OrdersContext)

  const recentItems = useMemo(() => {
    const sortedOrders = [...(orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const seen = new Set()
    const items = []
    for (const order of sortedOrders) {
      for (const item of order?.items || []) {
        const key = item?.food || item?.title
        if (!key || seen.has(key)) continue
        seen.add(key)
        items.push({ ...item, restaurant: order.restaurant })
        if (items.length >= 8) return items
      }
    }
    return items
  }, [orders])

  if (loadingOrders) return <MainLoadingUI />
  if (recentItems.length === 0) return null

  return (
    <View style={styles().section}>
      <View style={styles(currentTheme).header}>
        <TextDefault H3 bolder textColor={currentTheme.black}>
          {t('orderItAgain')}
        </TextDefault>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('MyOrders')}>
          <TextDefault uppercase bolder small textColor={currentTheme.primary}>
            {t('allOrders')}
          </TextDefault>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        style={styles().list}
        showsHorizontalScrollIndicator={false}
        inverted={currentTheme?.isRTL}
        data={recentItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles().listContent}
        renderItem={({ item }) => <ReorderCard item={item} />}
      />
    </View>
  )
}

export default ReorderRail
