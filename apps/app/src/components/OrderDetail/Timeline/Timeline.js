import React from 'react'
import { View, Pressable, Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useStyles } from './styles'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'
import ChatIcon from '../../../assets/SVG/chat-icon'

const STEPS = [
  { key: 'confirmed', status: ORDER_STATUS_ENUM.ACCEPTED, labelKey: 'orderConfirmed', timeKey: 'acceptedAt', showsRestaurant: true },
  { key: 'grill', status: ORDER_STATUS_ENUM.ASSIGNED, labelKey: 'offTheGrillBagged', timeKey: 'assignedAt' },
  { key: 'onway', status: ORDER_STATUS_ENUM.PICKED, labelKey: 'onTheWayToYou', timeKey: 'pickedAt' },
  { key: 'gate', status: ORDER_STATUS_ENUM.DELIVERED, labelKey: 'leftAtYourGate', timeKey: 'deliveredAt' }
]

const TRACKABLE_STATUSES = STEPS.map((s) => s.status)

const formatTime = (date) => (date ? new Date(date).toLocaleTimeString('en-US', { timeStyle: 'short' }) : null)

export const Timeline = ({ theme, orderStatus, restaurantName, acceptedAt, assignedAt, pickedAt, deliveredAt, rider, orderId, orderNo, total, t }) => {
  const styles = useStyles(theme)
  const navigation = useNavigation()

  if (!TRACKABLE_STATUSES.includes(orderStatus)) return null

  const timestamps = { acceptedAt, assignedAt, pickedAt, deliveredAt }
  const currentIndex = STEPS.findIndex((s) => s.status === orderStatus)
  const isDelivered = orderStatus === ORDER_STATUS_ENUM.DELIVERED

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const done = currentIndex > index || isDelivered
        const isCurrent = currentIndex === index && !isDelivered
        const showCourier = !!rider && isCurrent && (step.status === ORDER_STATUS_ENUM.ASSIGNED || step.status === ORDER_STATUS_ENUM.PICKED)
        const time = formatTime(timestamps[step.timeKey])
        const isLast = index === STEPS.length - 1

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.marker, done && styles.markerDone, isCurrent && styles.markerCurrent, !done && !isCurrent && styles.markerFuture]}>
                {isCurrent && <View style={styles.markerDot} />}
              </View>
              {!isLast && <View style={[styles.line, (done || isCurrent) && styles.lineDone]} />}
            </View>
            <View style={styles.rowContent}>
              <TextDefault uppercase bolder H5 textColor={done || isCurrent ? theme.black : theme.gray500}>
                {t(step.labelKey)}
              </TextDefault>
              {!!time && (
                <TextDefault small textColor={theme.gray500}>
                  {time}
                  {step.showsRestaurant && restaurantName ? ` · ${restaurantName}` : ''}
                </TextDefault>
              )}
              {showCourier && (
                <View style={styles.courierCard}>
                  <View style={styles.courierAvatar}>
                    <TextDefault bolder textColor={theme.white}>
                      {rider?.name?.charAt(0)?.toUpperCase() || 'R'}
                    </TextDefault>
                  </View>
                  <View style={styles.courierInfo}>
                    <TextDefault uppercase bolder H5 textColor={theme.black}>
                      {rider?.name}
                    </TextDefault>
                    <TextDefault small textColor={theme.gray500}>
                      {t('yourRider')}
                    </TextDefault>
                  </View>
                  {!!rider?.phone && (
                    <Pressable style={styles.iconBtnPrimary} onPress={() => Linking.openURL(`tel:${rider.phone}`)}>
                      <TextDefault textColor={theme.white}>✆</TextDefault>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.iconBtnDark}
                    onPress={() => navigation.navigate('ChatWithRider', { id: orderId, orderNo, total, riderPhone: rider?.phone, riderName: rider?.name })}
                  >
                    <ChatIcon fill='none' stroke={theme.white} width={18} height={18} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}
