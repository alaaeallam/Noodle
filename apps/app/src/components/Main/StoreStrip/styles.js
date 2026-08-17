import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingVertical: scale(11),
      paddingHorizontal: scale(20),
      backgroundColor: '#141414',
      borderTopWidth: scale(2),
      borderTopColor: props?.primary || '#FF1D02'
    },
    dot: {
      width: scale(9),
      height: scale(9),
      backgroundColor: props?.primary || '#FF1D02'
    },
    switchLabel: {
      marginLeft: props?.isRTL ? 0 : 'auto',
      marginRight: props?.isRTL ? 'auto' : 0
    }
  })

export default styles
