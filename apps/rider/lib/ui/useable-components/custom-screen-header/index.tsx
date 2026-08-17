import { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";

// Black chrome bar shared by tab screens (Wallet/Earnings/Profile) —
// see mockup screens 04/05/06. `right` is an optional slot for a
// screen-specific status label (e.g. "1 on the road").
export default function CustomScreenHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  const { appTheme } = useApptheme();
  return (
    <View style={{ backgroundColor: appTheme.black }}>
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center gap-4 px-[22px] pb-4 pt-1.5">
          <Text
            style={{
              color: appTheme.white,
              fontFamily: "Anton",
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {title}
          </Text>
          {right ? <View className="ml-auto">{right}</View> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
