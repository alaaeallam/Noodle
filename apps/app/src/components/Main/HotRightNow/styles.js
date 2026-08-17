import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    section: {
      gap: scale(10)
    },
    header: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: scale(16)
    },
    list: {
      gap: scale(14),
      paddingHorizontal: scale(16)
    }
  })

export default styles
