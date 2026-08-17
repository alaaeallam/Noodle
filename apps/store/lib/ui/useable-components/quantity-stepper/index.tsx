import { useApptheme } from "@/lib/context/theme.context";
import { Text, TouchableOpacity, View } from "react-native";

interface IQuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
}

export default function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
}: IQuantityStepperProps) {
  const { appTheme } = useApptheme();

  return (
    <View
      className="flex-row items-center"
      style={{ borderWidth: 2, borderColor: appTheme.black }}
    >
      <TouchableOpacity
        onPress={onDecrement}
        disabled={value <= min}
        className="w-10 h-10 items-center justify-center"
        style={{ backgroundColor: appTheme.white }}
      >
        <Text
          style={{
            color: value <= min ? "#B4B0AB" : appTheme.black,
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          –
        </Text>
      </TouchableOpacity>
      <Text
        className="min-w-[36px] text-center"
        style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 18 }}
      >
        {value}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        className="w-10 h-10 items-center justify-center"
        style={{ backgroundColor: appTheme.black }}
      >
        <Text style={{ color: appTheme.white, fontSize: 20, fontWeight: "800" }}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}
