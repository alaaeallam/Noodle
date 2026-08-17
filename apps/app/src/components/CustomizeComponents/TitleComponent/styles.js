import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      width: '100%',
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginVertical: scale(10),
      justifyContent: 'space-between',
      gap: scale(10)
    },
    left: {
      flex: 1,
      gap: scale(2)
    },
    labelRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    badge: {
      paddingHorizontal: scale(8),
      paddingVertical: scale(3),
      backgroundColor: props != null ? props?.black : '#0A0A0A'
    },
    badgeText: {
      fontSize: scale(10)
    }
  })
export default styles
