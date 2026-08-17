import { scale } from '../../../utils/scaling'
import { StyleSheet } from 'react-native'

const styles = (props = null) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: scale(16)
    },
    banner: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      height: scale(126),
      backgroundColor: props != null ? props?.primary : '#FF1D02',
      overflow: 'hidden'
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      padding: scale(14),
      justifyContent: 'space-between'
    },
    eyebrow: {
      letterSpacing: 1
    },
    cta: {
      alignSelf: 'flex-start',
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      backgroundColor: props != null ? props?.black : '#0A0A0A'
    },
    image: {
      width: scale(132),
      height: '100%'
    },
    pagination: {
      position: 'relative',
      marginTop: scale(8)
    },
    paginationItemActive: {
      width: scale(16),
      height: scale(4),
      marginHorizontal: scale(2)
    },
    paginationItemInactive: {
      width: scale(4),
      height: scale(4),
      marginHorizontal: scale(2)
    }
  })

export default styles
