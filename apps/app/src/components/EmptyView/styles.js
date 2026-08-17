import { scale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'

const styles = (props = null) =>
  StyleSheet.create({
    mainContainerEmpty: {
      backgroundColor: props !== null ? props?.themeBackground : 'transparent',
      paddingTop: scale(100)
    },
    subContainerImage: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center'
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.MBlarge
    },
    descriptionEmpty: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.Plarge
    },
    emptyButton: {
      backgroundColor: props !== null ? props?.newheaderColor : '#FF1D02',
      width: '85%',
      height: scale(54),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    }
  })

export default styles
