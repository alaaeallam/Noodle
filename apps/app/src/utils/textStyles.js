import { scale } from './scaling'
import { fontStyles } from './fontStyles'

export const textStyles = {
  // H1-H3 are the "headline" sizes — the BTB brand uses the condensed Anton
  // display face for these regardless of bold/bolder, since Anton only ships
  // one weight. H4 and below stay on Archivo (Regular/Bold/Bolder below) to
  // match the mockup, which reserves Anton for actual headlines and uses
  // Archivo (heavier weights, uppercase where needed) for item names/labels.
  H1: {
    fontSize: scale(35),
    fontFamily: fontStyles.Anton,
    textTransform: 'uppercase',
    letterSpacing: 0.2
  },
  H2: {
    fontSize: scale(24),
    fontFamily: fontStyles.Anton,
    textTransform: 'uppercase',
    letterSpacing: 0.2
  },
  H3: {
    fontSize: scale(20),
    fontFamily: fontStyles.Anton,
    textTransform: 'uppercase',
    letterSpacing: 0.2
  },
  H4: {
    fontSize: scale(16)
  },
  H5: {
    fontSize: scale(14)
  },
  Normal: {
    fontSize: scale(12)
  },
  Small: {
    fontSize: scale(10)
  },
  Smaller: {
    fontSize: scale(8)
  },
  Regular: {
    fontFamily: fontStyles.Archivo400
  },
  Bold: {
    fontFamily: fontStyles.Archivo700
  },
  Bolder: {
    fontFamily: fontStyles.Archivo900
  },
  Center: {
    textAlign: 'center'
  },
  Right: {
    textAlign: 'right'
  },
  Left: {
    textAlign: 'left'
  },
  UpperCase: {
    textTransform: 'uppercase'
  },
  LineOver: {
    textDecorationLine: 'line-through'
  },
  B700: {
    fontWeight: '700'
  },

  TextItalic: {
    fontStyle: 'italic',
  }


}
