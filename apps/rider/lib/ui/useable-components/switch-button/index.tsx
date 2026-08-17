import { useApptheme } from "@/lib/context/global/theme.context";
import { CustomSwitchProps } from "@/lib/utils/interfaces/custom-input-switch";
import { Switch, TouchableOpacity, View } from "react-native";

// BTB switch: a plain black track with a square white knob that slides
// side to side — no rounded pill, no check/x icon (see mockup screen 07).
const CustomSwitch = ({ value, onToggle, isDisabled }: CustomSwitchProps) => {
  const { appTheme } = useApptheme();

  return (
    <TouchableOpacity
      disabled={isDisabled}
      className={`flex-row items-center ${isDisabled && "opacity-35"}`}
      onPress={() => onToggle(!value)}
      activeOpacity={0.8}
    >
      <View
        className="w-16 h-8 flex-row items-center px-1"
        style={{
          backgroundColor: appTheme.black,
          justifyContent: value ? "flex-end" : "flex-start",
        }}
      >
        <View
          className="h-[22px] w-[22px]"
          style={{ backgroundColor: appTheme.white }}
        />

        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "transparent", true: "transparent" }}
          thumbColor={appTheme.white}
          className="absolute inset-0 w-full h-full opacity-0"
        />
      </View>
    </TouchableOpacity>
  );
};

export default CustomSwitch;
