import { StyleSheet } from 'react-native'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
  mainContainer: {
    width: '100%',
    flexDirection: props?.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(13),
    marginBottom: scale(9),
    borderWidth: scale(2)
  },
  leftContainer: {
    width: '70%',
    flexDirection: props?.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: scale(12)
  },
  rightContainer: {
    width: '30%',
    flexDirection: props?.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'flex-end'
    },
    title: {
      flexShrink: 1
    }
})
export default styles
