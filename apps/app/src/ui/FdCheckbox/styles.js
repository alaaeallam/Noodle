import { scale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
const styles = (props = null) =>
  StyleSheet.create({
    mainContainer: {
      borderColor: props !== null ? props?.borderColor : '#E4E1DD',
      borderWidth: scale(2),
      width: scale(20),
      height: scale(20),
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
export default styles
