import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

export const useStyles = (theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: scale(24),
      paddingTop: scale(22)
    },
    row: {
      flexDirection: theme?.isRTL ? 'row-reverse' : 'row',
      gap: scale(16)
    },
    markerColumn: {
      width: scale(22),
      alignItems: 'center'
    },
    marker: {
      width: scale(16),
      height: scale(16),
      borderWidth: scale(2),
      borderColor: theme.borderColor,
      backgroundColor: theme.white
    },
    markerDone: {
      backgroundColor: theme.main,
      borderColor: theme.main
    },
    markerCurrent: {
      width: scale(22),
      height: scale(22),
      backgroundColor: theme.black,
      borderColor: theme.black,
      alignItems: 'center',
      justifyContent: 'center'
    },
    markerFuture: {
      backgroundColor: theme.white,
      borderColor: theme.borderColor
    },
    markerDot: {
      width: scale(6),
      height: scale(6),
      backgroundColor: theme.main
    },
    line: {
      flex: 1,
      width: scale(3),
      backgroundColor: theme.borderColor,
      marginTop: scale(2)
    },
    lineDone: {
      backgroundColor: theme.main
    },
    rowContent: {
      flex: 1,
      paddingBottom: scale(24),
      gap: scale(3)
    },
    courierCard: {
      flexDirection: theme?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(12),
      padding: scale(12),
      backgroundColor: theme.themeBackground,
      marginTop: scale(6)
    },
    courierAvatar: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      backgroundColor: theme.black,
      alignItems: 'center',
      justifyContent: 'center'
    },
    courierInfo: {
      flex: 1,
      gap: scale(2)
    },
    iconBtnPrimary: {
      width: scale(38),
      height: scale(38),
      backgroundColor: theme.main,
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconBtnDark: {
      width: scale(38),
      height: scale(38),
      backgroundColor: theme.black,
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
