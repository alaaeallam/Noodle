import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    list: {
      flexGrow: 0
    },
    listContent: {
      gap: scale(8),
      paddingHorizontal: scale(16),
      paddingVertical: scale(14)
    },
    chip: {
      height: scale(32),
      paddingHorizontal: scale(14),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: scale(1),
      borderColor: props != null ? props?.black : '#0A0A0A'
    },
    chipActive: {
      backgroundColor: props != null ? props?.black : '#0A0A0A'
    },
    chipInactive: {
      backgroundColor: props != null ? props?.cardBackground : '#fff'
    }
  })

export default styles
