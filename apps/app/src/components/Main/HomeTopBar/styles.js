import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const DARK_SURFACE = 'rgba(10,10,10,.62)'
const DARK_BORDER = 'rgba(255,255,255,.24)'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      backgroundColor: props?.black || '#0A0A0A',
      paddingBottom: scale(12)
    },
    topRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingHorizontal: scale(16)
    },
    addressPill: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(6),
      height: scale(38),
      paddingHorizontal: scale(12),
      backgroundColor: DARK_SURFACE,
      borderWidth: scale(2),
      borderColor: DARK_BORDER,
      flexShrink: 1
    },
    addressToLabel: {
      color: props?.primary || '#FF1D02'
    },
    addressText: {
      flexShrink: 1
    },
    iconButton: {
      width: scale(38),
      height: scale(38),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: DARK_SURFACE,
      borderWidth: scale(2),
      borderColor: DARK_BORDER
    },
    cartButton: {
      marginLeft: props?.isRTL ? 0 : 'auto',
      marginRight: props?.isRTL ? 'auto' : 0,
      backgroundColor: props?.primary || '#FF1D02',
      borderWidth: 0
    },
    cartBadge: {
      position: 'absolute',
      top: scale(-6),
      right: scale(-6),
      minWidth: scale(18),
      height: scale(18),
      paddingHorizontal: scale(3),
      backgroundColor: props?.white || '#FFF',
      borderWidth: scale(2),
      borderColor: props?.black || '#0A0A0A',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default styles
