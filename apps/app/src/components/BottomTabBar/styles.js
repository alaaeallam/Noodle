import { StyleSheet } from 'react-native'
import { scale } from '../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: props != null ? props?.headerBackground : '#0A0A0A',
      paddingTop: scale(12)
    },
    tab: {
      alignItems: 'center',
      gap: scale(6)
    },
    indicator: {
      width: scale(18),
      height: scale(3)
    }
  })

export default styles
