import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

export const useStyles = (theme) =>
  StyleSheet.create({
    hero: {
      paddingHorizontal: scale(24),
      paddingTop: scale(20),
      paddingBottom: scale(26),
      gap: scale(6)
    },
    heroActive: {
      backgroundColor: theme.main
    },
    heroWaiting: {
      backgroundColor: theme.black
    },
    heroCancelled: {
      backgroundColor: theme.gray500
    },
    eyebrow: {
      letterSpacing: scale(1.5)
    },
    subtext: {
      opacity: 0.9,
      marginTop: scale(2)
    }
  })
