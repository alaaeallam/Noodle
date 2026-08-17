/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// BTB (Between The Buns) brand palette — see apps/app/src/utils/themeColors.js
// for the customer-app equivalent; keep both in sync when the brand changes.
export const Colors = {
  light: {
    primary: "#FF1D02",
    themeBackground: "#F4F2EF",
    iconColor: "#3A3A3A",
    tagColor: "#FF1D02",
    iconPink: "#FF1D02",
    radioColor: "#FFF",
    radioOuterColor: "#FF1D02",
    spinnerColor: "#FF1D02",
    orderComplete: "#1DB20D",
    orderUncomplete: "#FF1D02",
    horizontalLine: "#E4E1DD",
    buttonBackground: "#FF1D02",
    buttonText: "#FFF",
    buttonBackgroundPink: "#FF1D02",
    buttonTextPink: "#FFF",
    textErrorColor: "#FF1D02",
    headerBackground: "#0A0A0A",
    headerText: "#FFF",
    fontMainColor: "#0A0A0A",
    fontSecondColor: "#6B6B6B",
    cartContainer: "#FFF",
    startColor: "#FF1D02",
    white: "#FFF",
    black: "#0A0A0A",
    tabNaviatorBackground: "#0A0A0A",
    secondaryTextColor: "#6B6B6B",
    lowOpacityPrimaryColor: "rgba(255, 29, 2, 0.08)",
    mainTextColor: "#0A0A0A",
    switchButtonColor: "#0A0A0A",
    sidebarIconBackground: "#F4F2EF",
    borderLineColor: "#E4E1DD",
    gray: "#E4E1DD",
    screenBackground: "#FFF",
    linkColor: "#FF1D02",
    error: "#FF1D02",
  },
  // BTB's mockup defines a single (light) visual identity — white/cream
  // cards with dark ink text, black used only for chrome (header/nav/badges).
  // There's no designed dark mode, and several restyled components hardcode
  // a white card background (`appTheme.white`) with theme-dependent text
  // (`appTheme.fontMainColor`) on top of it — if `dark.fontMainColor` were
  // white, that text goes invisible (white-on-white) whenever the device is
  // in system Dark Mode. So `dark` intentionally mirrors `light` exactly
  // until BTB has an actual dark-mode design.
  dark: {
    primary: "#FF1D02",
    themeBackground: "#F4F2EF",
    iconColor: "#3A3A3A",
    tagColor: "#FF1D02",
    iconPink: "#FF1D02",
    radioColor: "#FFF",
    radioOuterColor: "#FF1D02",
    spinnerColor: "#FF1D02",
    orderComplete: "#1DB20D",
    orderUncomplete: "#FF1D02",
    horizontalLine: "#E4E1DD",
    buttonBackground: "#FF1D02",
    buttonText: "#FFF",
    buttonBackgroundPink: "#FF1D02",
    buttonTextPink: "#FFF",
    textErrorColor: "#FF1D02",
    headerBackground: "#0A0A0A",
    headerText: "#FFF",
    fontMainColor: "#0A0A0A",
    fontSecondColor: "#6B6B6B",
    cartContainer: "#FFF",
    startColor: "#FF1D02",
    white: "#FFF",
    black: "#0A0A0A",
    tabNaviatorBackground: "#0A0A0A",
    secondaryTextColor: "#6B6B6B",
    lowOpacityPrimaryColor: "rgba(255, 29, 2, 0.08)",
    mainTextColor: "#0A0A0A",
    switchButtonColor: "#0A0A0A",
    sidebarIconBackground: "#F4F2EF",
    borderLineColor: "#E4E1DD",
    gray: "#E4E1DD",
    screenBackground: "#FFF",
    linkColor: "#FF1D02",
    error: "#FF1D02",
  },
};
