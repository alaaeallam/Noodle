import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    card: {
      backgroundColor: props != null ? props?.white : '#FFF',
      borderWidth: scale(2),
      borderColor: props != null ? props?.borderColor : '#E4E1DD'
    },
    imageWrap: {
      height: scale(158),
      position: 'relative'
    },
    imageWrapCompact: {
      height: scale(112)
    },
    image: {
      width: '100%',
      height: '100%'
    },
    favouriteBtn: {
      position: 'absolute',
      top: scale(10),
      right: scale(10),
      width: scale(34),
      height: scale(34),
      backgroundColor: 'rgba(255,255,255,0.94)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    details: {
      padding: scale(13),
      gap: scale(6)
    },
    tagRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12),
      paddingTop: scale(4)
    }
  })

export default styles
