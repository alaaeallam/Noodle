import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    card: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12),
      backgroundColor: props != null ? props?.white : '#FFF',
      padding: scale(10),
      borderWidth: scale(2),
      borderColor: props != null ? props?.borderColor : '#E4E1DD'
    },
    image: {
      width: scale(74),
      height: scale(74)
    },
    details: {
      flex: 1,
      gap: scale(4)
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: scale(7),
      paddingVertical: scale(3),
      backgroundColor: props != null ? props?.primary : '#FF1D02',
      marginBottom: scale(2)
    },
    badgeText: {
      fontSize: scale(9)
    },
    tagRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingTop: scale(2)
    },
    restaurantName: {
      flexShrink: 1
    }
  })

export default styles
