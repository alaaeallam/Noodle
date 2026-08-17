import { StyleSheet } from 'react-native'
import { scale } from '../../utils/scaling'

export const useStyles = (theme) =>
  StyleSheet.create({
    container: {
      height: scale(44),
      flex: 1
    },
    ovalContainer: {
      flex: 1,
      gap: scale(8),
      marginHorizontal: scale(16),
      marginVertical: scale(3),
      flexDirection: theme?.isRTL ? 'row-reverse' : 'row'
    },
    ovalButton: {
      flex: 1,
      borderWidth: scale(2),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    ovalButtonActive: {
      backgroundColor: theme?.black,
      borderColor: theme?.black
    },
    ovalButtonInactive: {
      backgroundColor: theme?.white,
      borderColor: theme?.borderColor
    },
    instructionContainer: {
      padding: scale(10),
      flexDirection: theme?.isRTL ? 'row-reverse' : 'row',
      margin: scale(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: scale(10),
      borderColor: theme.gray500
    },
    leftContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    middleContainer: { flex: 6, justifyContent: 'space-evenly' },

    navigateButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.main,
      borderColor: theme.main,
      borderWidth: 1,
      borderRadius: scale(25),
      width: scale(200)
    },
    dismissButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: scale(25),
      width: scale(200),
      borderColor: theme.newIconColor
    },
    modalContainer: {
      backgroundColor: theme?.themeBackground,
      borderWidth: 1,
      borderColor: theme.newIconColor,
      borderRadius: scale(20),
      padding: scale(20),
      width: '90%', // Adjust width as needed
      alignSelf: 'center', // Horizontal centering
      justifyContent: 'center', // Vertical centering
      alignItems: 'center', // Ensure content is centered
      height: 'auto', // Auto height
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      justifyContent: 'center', // Vertical centering of modal
      alignItems: 'center', // Horizontal centering of modal
    }
  })
