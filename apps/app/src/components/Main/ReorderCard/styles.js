import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    card: {
      width: scale(236),
      backgroundColor: props != null ? props?.white : '#FFF',
      borderWidth: scale(2),
      borderColor: props != null ? props?.borderColor : '#E4E1DD',
      padding: scale(10),
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    image: {
      width: scale(76),
      height: scale(76)
    },
    details: {
      flex: 1,
      gap: scale(6)
    },
    reorderBtn: {
      alignSelf: 'flex-start',
      height: scale(32),
      paddingHorizontal: scale(14),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props != null ? props?.primary : '#FF1D02'
    }
  })

export default styles
