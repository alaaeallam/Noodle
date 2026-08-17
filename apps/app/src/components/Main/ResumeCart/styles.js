import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    card: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12),
      marginHorizontal: scale(20),
      padding: scale(10),
      backgroundColor: props?.white || '#FFF',
      borderWidth: scale(2),
      borderColor: props?.black || '#0A0A0A'
    },
    image: {
      width: scale(42),
      height: scale(42)
    },
    details: {
      flex: 1,
      gap: scale(2),
      minWidth: 0
    },
    resumeBtn: {
      marginLeft: props?.isRTL ? 0 : 'auto',
      marginRight: props?.isRTL ? 'auto' : 0,
      height: scale(34),
      paddingHorizontal: scale(14),
      backgroundColor: props?.black || '#0A0A0A',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default styles
