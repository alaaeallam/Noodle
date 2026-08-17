import { scale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { verticalScale } from '../../utils/scaling'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    cartAddress: {
      ...alignment.PBmedium,
      backgroundColor: props !== null ? props.themeBackground : 'transparent'
    },
    headingBlock: {
      paddingHorizontal: scale(24),
      paddingTop: scale(20),
      gap: scale(10)
    },
    eyebrow: {
      letterSpacing: scale(1.2)
    },
    subtext: {
      marginTop: scale(2)
    },
    currentLocationBtn: {
      height: scale(54),
      backgroundColor: props !== null ? props.main : '#FF1D02',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      gap: scale(8)
    },
    savedLabel: {
      marginTop: scale(6),
      letterSpacing: scale(1)
    },
    width100: {
      width: '100%'
    },
    titleAddress: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center'
    },
    addressIconBox: {
      width: scale(42),
      height: scale(42),
      backgroundColor: props !== null ? props.themeBackground : '#F4F2EF',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addressTextBlock: {
      flex: 1,
      gap: scale(3)
    },
    containerSpace: theme => ({
      backgroundColor: theme !== null ? theme.white : 'transparent',
      flexDirection: theme?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(14),
      padding: scale(14),
      borderWidth: scale(2),
      borderColor: theme !== null ? theme.borderColor : '#E4E1DD'
    }),
    containerSpaceSelected: theme => ({
      backgroundColor: theme !== null ? theme.newButtonBackground : '#FFF3F1',
      borderColor: theme !== null ? theme.main : '#FF1D02'
    }),
    editBtn: {
      padding: scale(4)
    },
    containerButton: {
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      width: '90%',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      ...alignment.MBsmall
    },
    addButton: {
      backgroundColor: props !== null ? props.white : 'transparent',
      borderWidth: scale(2),
      borderColor: props !== null ? props.black : '#0A0A0A',
      width: '100%',
      height: scale(50),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    },
    continueButton: {
      backgroundColor: props !== null ? props.black : '#0A0A0A',
      width: '100%',
      height: scale(56),
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    }
  })
export default styles
