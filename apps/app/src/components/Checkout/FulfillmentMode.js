import React from 'react'
import { Pressable, View } from 'react-native'
import { useStyles } from './styles'
import TextDefault from '../Text/TextDefault/TextDefault'

import DeliveryIcon from '../../assets/SVG/delivery-icon'
import PickupIcon from '../../assets/SVG/pickup-icon'
import { alignment } from '../../utils/alignment'

export const FulfillmentMode = ({ theme, isPickup, setIsPickup, t }) => {
    const styles = useStyles(theme)
    return <View style={styles.container}>
        <View style={styles.ovalContainer}>
            <OvalButton theme={theme} styles={styles} title={t('Delivery')} selected={!isPickup} Icon={DeliveryIcon} onSelect={() => { setIsPickup(false) }} />
            <OvalButton theme={theme} styles={styles} title={t('Pickup')} selected={isPickup} Icon={PickupIcon} onSelect={() => { setIsPickup(true) }} />
        </View>
    </View>
}

const OvalButton = ({
    theme,
    selected = false, title,
    Icon,
    onSelect,
    styles }) => (<Pressable onPress={onSelect} style={[styles.ovalButton, selected ? styles.ovalButtonActive : styles.ovalButtonInactive]}>
        <View style={alignment.MxSmall}>
            <Icon color={selected ? theme.white : theme.black} />
        </View>
        <TextDefault uppercase bolder small textColor={selected ? theme.white : theme.black}>{title}</TextDefault>
    </Pressable>)
