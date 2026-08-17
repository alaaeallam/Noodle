import React from 'react'
import { View } from 'react-native'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useStyles } from './styles'
import { ORDER_STATUS_ENUM } from '../../../utils/enums'
import { checkStatus } from '../../Main/ActiveOrders/ProgressBar'

const ACTIVE_STATUSES = [ORDER_STATUS_ENUM.ACCEPTED, ORDER_STATUS_ENUM.ASSIGNED, ORDER_STATUS_ENUM.PICKED]
const DONE_STATUSES = [ORDER_STATUS_ENUM.DELIVERED, ORDER_STATUS_ENUM.COMPLETED]

export const TrackingHero = ({ theme, orderStatus, remainingTimeState, t }) => {
  const styles = useStyles(theme)

  if (orderStatus === ORDER_STATUS_ENUM.PENDING) {
    return (
      <View style={[styles.hero, styles.heroWaiting]}>
        <TextDefault uppercase bolder small textColor={theme.white} style={styles.eyebrow}>
          {t('orderReceived')}
        </TextDefault>
        <TextDefault H1 bolder textColor={theme.white}>
          {t('hangTight')}
        </TextDefault>
        <TextDefault textColor={theme.white} style={styles.subtext}>
          {t('pendingOrder')}
        </TextDefault>
      </View>
    )
  }

  if (ACTIVE_STATUSES.includes(orderStatus)) {
    return (
      <View style={[styles.hero, styles.heroActive]}>
        <TextDefault uppercase bolder small textColor={theme.white} style={styles.eyebrow}>
          {t('arriving')}
        </TextDefault>
        <TextDefault H1 bolder textColor={theme.white}>
          {remainingTimeState}—{remainingTimeState + 5} {t('mins')}
        </TextDefault>
        <TextDefault textColor={theme.white} style={styles.subtext}>
          {t(checkStatus(orderStatus)?.statusText)}
        </TextDefault>
      </View>
    )
  }

  if (DONE_STATUSES.includes(orderStatus)) {
    return (
      <View style={[styles.hero, styles.heroWaiting]}>
        <TextDefault uppercase bolder small textColor={theme.white} style={styles.eyebrow}>
          {t('DELIVERED')}
        </TextDefault>
        <TextDefault H1 bolder textColor={theme.white}>
          {t('DELIVEREDStatusMessage')}
        </TextDefault>
      </View>
    )
  }

  return (
    <View style={[styles.hero, styles.heroCancelled]}>
      <TextDefault uppercase bolder small textColor={theme.white} style={styles.eyebrow}>
        {t('CANCELLED')}
      </TextDefault>
      <TextDefault textColor={theme.white} style={styles.subtext}>
        {t('CANCELLEDStatusMessage')}
      </TextDefault>
    </View>
  )
}
