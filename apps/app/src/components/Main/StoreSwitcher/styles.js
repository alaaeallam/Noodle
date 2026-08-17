import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    modal: {
      backgroundColor: props?.white || '#FFF'
    },
    handle: {
      backgroundColor: props?.horizontalLine || '#E4E1DD'
    },
    header: {
      paddingHorizontal: scale(20),
      paddingTop: scale(18),
      paddingBottom: scale(14),
      borderBottomWidth: scale(2),
      borderBottomColor: props?.horizontalLine || '#E4E1DD'
    },
    row: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(14),
      paddingHorizontal: scale(20),
      paddingVertical: scale(15),
      borderBottomWidth: scale(2),
      borderBottomColor: props?.horizontalLine || '#E4E1DD'
    },
    rowActive: {
      backgroundColor: props?.newButtonBackground || '#FFF3F1'
    },
    details: {
      flex: 1,
      gap: scale(2),
      minWidth: 0
    }
  })

export default styles
