import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const DARK_SURFACE = '#1C1C1C'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      backgroundColor: props != null ? props?.headerBackground : '#0A0A0A',
      paddingHorizontal: scale(16),
      paddingBottom: scale(16)
    },
    topRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: scale(14)
    },
    addressButton: {
      flexShrink: 1,
      marginRight: scale(10)
    },
    deliverToLabel: {
      letterSpacing: 0.5,
      marginBottom: scale(2)
    },
    addressRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(4)
    },
    addressText: {
      flexShrink: 1
    },
    cartButton: {
      width: scale(40),
      height: scale(40),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: DARK_SURFACE
    },
    cartBadge: {
      position: 'absolute',
      top: scale(-4),
      right: scale(-4),
      minWidth: scale(18),
      height: scale(18),
      paddingHorizontal: scale(3),
      backgroundColor: props != null ? props?.primary : '#FF1D02',
      borderWidth: scale(2),
      borderColor: props != null ? props?.headerBackground : '#0A0A0A',
      justifyContent: 'center',
      alignItems: 'center'
    },
    cartBadgeText: {
      fontSize: scale(9)
    },
    searchBar: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(8),
      height: scale(44),
      paddingHorizontal: scale(14),
      backgroundColor: DARK_SURFACE
    },
    searchPlaceholder: {
      flexShrink: 1
    }
  })

export default styles
