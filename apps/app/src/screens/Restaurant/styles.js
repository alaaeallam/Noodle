import { scale, verticalScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: props != null ? props.themeBackground : 'white'
    },
    navbarContainer: {
      paddingBottom: 0,
      height: '5%',
      elevation: 4,
      shadowColor: theme.Pink.black,
      shadowOffset: {
        width: 0,
        height: verticalScale(2)
      },
      shadowOpacity: 0.6,
      shadowRadius: verticalScale(2),
      zIndex: 1
    },
    sectionHeader: {
      backgroundColor: props != null ? props.themeBackground : '#fff'
    },
    sectionHeaderText: {
      textTransform: 'capitalize',
      fontSize: scale(18),
      fontWeight: '600',
      ...alignment.PTlarge,
      paddingHorizontal: scale(15)
    },
    restaurantItems: {
      backgroundColor: props != null ? props.themeBackground : 'white'
    },
    popularItemCards: {
      ...alignment.PTlarge,
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingLeft: scale(17),
      paddingRight: scale(17),
      justifyContent: 'space-between',
      rowGap: scale(10)
    },
    dealSection: {
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    searchDealSection: {
      // position: 'relative',
      backgroundColor: props != null ? props.themeBackground : 'white',
      paddingVertical: scale(10),
      ...alignment.PRmedium,
      ...alignment.PLsmall
    },
    dealDescription: {
      backgroundColor: props != null ? props.themeBackground : 'white',
      ...alignment.PBsmall,
      ...alignment.PRxSmall
    },
    dealPrice: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      overflow: 'hidden'
    },
    priceText: {
      color: props != null ? props.darkBgFont : 'white',
      fontSize: 15,
      paddingTop: scale(10),
      maxWidth: '100%',
      ...alignment.MRxSmall
    },

    headerText: {
      fontSize: 18,
      paddingTop: scale(5),
      maxWidth: '100%',
      ...alignment.MRxSmall,
      backgroundColor: props != null ? props.themeBackground : 'white'
    },
    dealImageWrap: {
      flex: 'none',
      position: 'relative'
    },
    dealImage: {
      width: scale(86),
      height: scale(86)
    },
    addToCart: {
      position: 'absolute',
      bottom: -scale(6),
      right: -scale(6),
      width: scale(30),
      height: scale(30),
      backgroundColor: props !== null ? props.primary : '#FF1D02',
      justifyContent: 'center',
      alignItems: 'center'
    },

    sectionSeparator: {
      width: '100%',
      height: scale(15),
      backgroundColor: props != null ? props.themeBackground : 'white'
    },

    buttonContainer: {
      width: '100%',
      height: '10%',
      backgroundColor: props !== null ? props.themeBackground : 'black',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 12,
      shadowColor: props !== null ? props.shadowColor : 'black',
      shadowOffset: {
        width: 0,
        height: -verticalScale(3)
      },
      shadowOpacity: 0.5,
      shadowRadius: verticalScale(2)
    },
    button: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 0,
      backgroundColor: props !== null ? props.black : 'black',
      height: '75%',
      width: '95%',
      ...alignment.PLsmall,
      ...alignment.PRsmall
    },
    triangleCorner: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: scale(25),
      borderTopWidth: scale(20),
      borderLeftColor: 'transparent',
      borderTopColor: props != null ? props.main : 'red'
    },
    tagText: {
      width: scale(15),
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 1,
      right: 0,
      textAlign: 'center'
    },
    popularHeading: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 6,
      ...alignment.PTlarge,
      paddingHorizontal: scale(15)
    },
    popularText: {
      textTransform: 'capitalize',
      fontSize: scale(18),
      fontWeight: '600'
    }
  })
export default styles
