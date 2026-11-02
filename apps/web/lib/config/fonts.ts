import localFont from "next/font/local";

// BTB brand type, same files as the mobile apps (apps/app/src/assets/font):
// Anton for display headlines, Archivo for everything else.
export const anton = localFont({
  src: "../assets/fonts/Anton-Regular.ttf",
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const archivo = localFont({
  src: [
    { path: "../assets/fonts/Archivo-Regular.ttf", weight: "400" },
    { path: "../assets/fonts/Archivo-Medium.ttf", weight: "500" },
    { path: "../assets/fonts/Archivo-SemiBold.ttf", weight: "600" },
    { path: "../assets/fonts/Archivo-Bold.ttf", weight: "700" },
    { path: "../assets/fonts/Archivo-ExtraBold.ttf", weight: "800" },
    { path: "../assets/fonts/Archivo-Black.ttf", weight: "900" },
  ],
  variable: "--font-archivo",
  display: "swap",
});
