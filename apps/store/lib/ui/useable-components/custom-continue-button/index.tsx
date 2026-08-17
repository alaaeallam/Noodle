import { useApptheme } from "@/lib/context/theme.context";
import { Text, TouchableOpacity } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";
import CustomSpinner from "../custom-spinner";

export default function CustomContinueButton({
  title,
  isLoading,
  ...props
}: { title: string; isLoading?: boolean } & TouchableOpacityProps) {
  // Hooks
  const { appTheme } = useApptheme();
  return (
    <TouchableOpacity
      {...props}
      className="h-[58px] w-full items-center justify-center my-auto mt-8"
      style={[
        { backgroundColor: appTheme.primary },
        props.disabled ? { opacity: 0.5 } : null,
      ]}
    >
      {isLoading ? (
        <CustomSpinner />
      ) : (
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
      )}
    </TouchableOpacity>
  );
}
