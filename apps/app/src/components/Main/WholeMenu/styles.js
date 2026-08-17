import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    section: {
      backgroundColor: props?.white || '#FFF'
    },
    header: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: scale(20),
      paddingBottom: scale(12)
    },
    row: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(14),
      paddingHorizontal: scale(20),
      paddingVertical: scale(13),
      borderTopWidth: scale(2),
      borderTopColor: props?.horizontalLine || '#E4E1DD'
    },
    index: {
      width: scale(24)
    },
    details: {
      flex: 1,
      gap: scale(3),
      minWidth: 0
    },
    addBtn: {
      width: scale(34),
      height: scale(34),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props?.black || '#0A0A0A'
    }
  })

export default styles
