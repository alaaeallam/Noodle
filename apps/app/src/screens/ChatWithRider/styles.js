import { StyleSheet, Platform } from 'react-native'
import { scale } from '../../utils/scaling'
import { fontStyles } from '../../utils/fontStyles'

const BLACK = '#0A0A0A'
const RED = '#FF1D02'
const CREAM = '#F4F2EF'
const BORDER = '#E4E1DD'
const GRAY = '#8A8A8A'

const styles = () =>
  StyleSheet.create({
    chatSec: {
      flex: 1,
      backgroundColor: CREAM
    },
    header: {
      backgroundColor: BLACK,
      paddingTop: Platform.OS === 'android' ? scale(24) : 0
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(14),
      paddingHorizontal: scale(20),
      paddingTop: scale(14),
      paddingBottom: scale(6)
    },
    headerIconOutlined: {
      width: scale(34),
      height: scale(34),
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.34)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerIconFilled: {
      width: scale(34),
      height: scale(34),
      backgroundColor: RED,
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: '#FFF',
      fontFamily: fontStyles.Anton,
      fontSize: scale(18),
      letterSpacing: 0.4,
      textTransform: 'uppercase'
    },
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingHorizontal: scale(20),
      paddingBottom: scale(14)
    },
    orderLabel: {
      color: GRAY,
      fontFamily: fontStyles.Archivo800,
      fontSize: scale(11),
      letterSpacing: 1.4,
      textTransform: 'uppercase'
    },
    orderBadge: {
      backgroundColor: RED,
      paddingHorizontal: scale(10),
      paddingVertical: scale(5)
    },
    orderBadgeText: {
      color: '#FFF',
      fontFamily: fontStyles.Anton,
      fontSize: scale(14),
      letterSpacing: 0.6
    },
    totalAmount: {
      marginLeft: 'auto',
      color: '#FFF',
      fontFamily: fontStyles.Anton,
      fontSize: scale(17)
    },
    riderBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
      paddingHorizontal: scale(20),
      paddingVertical: scale(11),
      backgroundColor: '#FFF',
      borderBottomWidth: 2,
      borderBottomColor: BORDER
    },
    riderDot: {
      width: scale(9),
      height: scale(9),
      backgroundColor: RED
    },
    riderName: {
      color: BLACK,
      fontFamily: fontStyles.Archivo800,
      fontSize: scale(13),
      letterSpacing: 0.4,
      textTransform: 'uppercase'
    },
    quickRepliesContainer: {
      gap: scale(8),
      paddingHorizontal: scale(20),
      paddingTop: scale(12),
      paddingBottom: scale(4)
    },
    quickReplyChip: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
      backgroundColor: '#FFF',
      borderWidth: 2,
      borderColor: BLACK
    },
    quickReplyText: {
      color: BLACK,
      fontFamily: fontStyles.Archivo800,
      fontSize: scale(12),
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    },
    toolbarWrapper: {
      backgroundColor: CREAM
    },
    inputToolbar: {
      backgroundColor: RED,
      paddingHorizontal: scale(10),
      paddingVertical: scale(8),
      borderTopWidth: 0
    },
    actionButton: {
      width: scale(40),
      height: scale(40),
      marginRight: scale(6),
      marginBottom: scale(2),
      backgroundColor: BLACK,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sendButton: {
      width: scale(40),
      height: scale(40),
      marginLeft: scale(6),
      marginBottom: scale(2),
      backgroundColor: BLACK,
      alignItems: 'center',
      justifyContent: 'center'
    },
    composer: {
      flex: 1,
      backgroundColor: '#FFF',
      fontSize: scale(14),
      fontFamily: fontStyles.Archivo700,
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
      marginVertical: scale(4),
      alignSelf: 'center'
    },
    username: {
      color: GRAY,
      fontFamily: fontStyles.Archivo800,
      fontSize: scale(11),
      marginBottom: 2
    },
    bubbleTextRight: {
      fontFamily: fontStyles.Archivo700,
      fontSize: scale(15),
      lineHeight: scale(20),
      padding: scale(10),
      color: '#FFF',
      backgroundColor: RED
    },
    bubbleTextLeft: {
      fontFamily: fontStyles.Archivo700,
      fontSize: scale(15),
      lineHeight: scale(20),
      padding: scale(10),
      color: BLACK,
      backgroundColor: '#FFF',
      borderWidth: 2,
      borderColor: BORDER,
      borderLeftWidth: 5,
      borderLeftColor: BLACK
    },
    timeText: {
      color: '#9A9A9A',
      fontSize: scale(11)
    },
    messagesContainer: {
      backgroundColor: CREAM,
      paddingHorizontal: scale(4)
    }
  })

export default styles
