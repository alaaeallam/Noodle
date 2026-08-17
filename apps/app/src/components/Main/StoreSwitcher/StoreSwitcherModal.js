import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { useTranslation } from 'react-i18next'
import TextDefault from '../../Text/TextDefault/TextDefault'
import styles from './styles'

function StoreSwitcherModal({ modalRef, currentTheme, stores, currentStoreId, onSelect }) {
  const { t } = useTranslation()

  return (
    <Modalize ref={modalRef} modalStyle={styles(currentTheme).modal} handleStyle={styles(currentTheme).handle} adjustToContentHeight>
      <View style={styles(currentTheme).header}>
        <TextDefault H3 bolder textColor={currentTheme.black}>
          {t('switchYourStore')}
        </TextDefault>
      </View>
      {(stores || []).map((store) => {
        const isActive = store._id === currentStoreId
        return (
          <TouchableOpacity
            key={store._id}
            activeOpacity={0.7}
            style={[styles(currentTheme).row, isActive && styles(currentTheme).rowActive]}
            onPress={() => {
              onSelect(store._id)
              modalRef.current?.close()
            }}
          >
            <View style={styles(currentTheme).details}>
              <TextDefault uppercase bolder numberOfLines={1} textColor={isActive ? currentTheme.primary : currentTheme.black}>
                {store.name}
              </TextDefault>
              <TextDefault numberOfLines={1} small textColor={currentTheme.fontSecondColor}>
                {store.address}
                {typeof store.distanceWithCurrentLocation === 'number' ? ` · ${store.distanceWithCurrentLocation.toFixed(1)} km` : ''}
              </TextDefault>
            </View>
          </TouchableOpacity>
        )
      })}
    </Modalize>
  )
}

export default StoreSwitcherModal
