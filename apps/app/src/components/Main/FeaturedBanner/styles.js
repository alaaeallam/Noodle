import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      height: scale(200),
      backgroundColor: props?.black || '#0A0A0A'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10,10,10,.55)'
    },
    content: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    bottomContent: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(18),
      gap: scale(8)
    },
    priceRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    addToBagBtn: {
      marginLeft: props?.isRTL ? 0 : 'auto',
      marginRight: props?.isRTL ? 'auto' : 0,
      height: scale(38),
      paddingHorizontal: scale(16),
      backgroundColor: props?.primary || '#FF1D02',
      justifyContent: 'center',
      alignItems: 'center'
    },
    pagination: {
      position: 'absolute',
      top: scale(14)
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
