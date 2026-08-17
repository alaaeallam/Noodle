import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TextDefault from '../Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import styles from './styles'

function BottomTabBar({ state, descriptors, navigation, currentTheme }) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles(currentTheme).container, { paddingBottom: insets.bottom + scale(10) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel ?? options.title ?? route.name
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity key={route.key} activeOpacity={0.7} onPress={onPress} style={styles().tab}>
            <TextDefault uppercase bolder small textColor={isFocused ? currentTheme.white : '#7A7A7A'}>
              {label}
            </TextDefault>
            <View style={[styles(currentTheme).indicator, { backgroundColor: isFocused ? currentTheme.primary : 'transparent' }]} />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default BottomTabBar
