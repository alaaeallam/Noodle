import { verticalScale, scale } from '../../../utils/scaling'
import { Dimensions, StyleSheet } from 'react-native'
const { height } = Dimensions.get('window')

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mainContainer: {
      width: '100%',
      height: height * 0.09,
      borderTopRightRadius: 0,
      borderTopLeftRadius: 0,
      shadowColor: props !== null ? props?.shadowColor : '#fefefe',
      shadowOffset: {
        width: 0,
        height: -verticalScale(2)
      },
      shadowOpacity: 0.8,
      shadowRadius: verticalScale(2),
      elevation: 10,
      backgroundColor: props !== null ? props?.themeBackground : '#a92d2d',
      justifyContent: 'center',
      alignItems: 'center'
    },
    subContainer: {
      width: '90%',
      height: '70%',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexDirection: 'row'
    },
    icon: {
      width: '8%',
      height: '55%',
      backgroundColor: props !== null ? props?.newFontcolor :'#fafafa',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 0
    },
    quantity: {
      borderWidth: 1,
      paddingLeft: scale(18),
      paddingRight: scale(18),
      paddingTop: scale(10),
      paddingBottom: scale(10),
      borderRadius: 0,
      borderColor: props !== null ? props?.newFontcolor :'#fafafa',
    },
    btnContainer: {
      width: '60%',
      height: '90%',
      backgroundColor: props !== null ? props?.main : 'black',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 0
    },
    btnContainerDisabled: {
      backgroundColor: props !== null ? props?.gray500 : '#6B6B6B',
      opacity: 0.6
    },
    // New styles for quantity
    actionContainer: {
      width: '30%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: props !== null ? props?.newBorderColor : '#F3F4F6',
      borderRadius: 0,
      borderWidth:1,
      borderColor:props !== null ? props?.iconBackground: '#fcfcfc',
    },
    actionContainerBtns: {
      width: scale(30),
      height:scale(30),
      borderRadius: 0,
      alignItems: 'center',
     justifyContent:'center'
    },
    minusBtn:{
      backgroundColor: '#fff',
    },
    plusBtn:{
      backgroundColor: props !== null ? props?.black : '#0A0A0A',
    },
    actionContainerView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
export default styles
