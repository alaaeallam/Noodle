import { useApptheme } from "@/lib/context/global/theme.context";
import { Text, TouchableOpacity } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";

export default function CustomContinueButton({
  title,
  style,
  ...props
}: { title: string } & TouchableOpacityProps) {
  // Hooks
  const { appTheme } = useApptheme();
  return (
    <TouchableOpacity
      {...props}
      className={`h-[58px] w-full items-center justify-center my-auto mt-8 ${props.className}`}
      style={[
        { backgroundColor: appTheme.primary },
        props.disabled ? { opacity: 0.5 } : null,
        style,
      ]}
    >
      <Text
        style={{
          color: appTheme.white,
          fontFamily: "Anton",
          fontSize: 19,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
