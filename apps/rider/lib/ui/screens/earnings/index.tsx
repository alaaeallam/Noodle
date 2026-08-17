// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";

// Core
import { View } from "react-native";

// Components
import EarningsMain from "../../screen-components/earnings/view/main";

export default function EarningsScreen() {
  // Hooks
  const { appTheme } = useApptheme();
  return (
    <View style={{ flex: 1, backgroundColor: appTheme.screenBackground }}>
      <EarningsMain />
    </View>
  );
}
