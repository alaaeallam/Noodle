import { useApptheme } from "@/lib/context/theme.context";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface IMenuItemVariation {
  _id: string;
  title: string;
  price: number;
}

interface IMenuItemCardProps {
  title: string;
  description?: string;
  image?: string;
  isOutOfStock?: boolean;
  variations: IMenuItemVariation[];
  onPress: () => void;
}

export default function MenuItemCard({
  title,
  description,
  image,
  isOutOfStock,
  variations,
  onPress,
}: IMenuItemCardProps) {
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  const startingPrice = variations?.length
    ? Math.min(...variations.map((v) => v.price))
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isOutOfStock}
      className="flex-row items-center gap-x-3 px-5 py-3.5"
      style={{
        backgroundColor: appTheme.white,
        borderBottomWidth: 2,
        borderColor: appTheme.horizontalLine,
        opacity: isOutOfStock ? 0.5 : 1,
      }}
    >
      <View
        className="w-[72px] h-[72px] overflow-hidden"
        style={{ backgroundColor: appTheme.themeBackground }}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: 72, height: 72 }} />
        ) : null}
      </View>

      <View className="flex-1 gap-y-1">
        <Text
          numberOfLines={1}
          style={{
            color: appTheme.fontMainColor,
            fontSize: 16,
            fontFamily: "Archivo900",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            numberOfLines={2}
            style={{ color: "#6B6B6B", fontSize: 13, lineHeight: 18 }}
          >
            {description}
          </Text>
        ) : null}
        <Text
          style={{ color: appTheme.fontMainColor, fontFamily: "Anton", fontSize: 18 }}
        >
          ${startingPrice.toFixed(2)}
        </Text>
      </View>

      {isOutOfStock ? (
        <Text style={{ color: appTheme.textErrorColor, fontSize: 12 }}>
          {t("Out of Stock")}
        </Text>
      ) : (
        <View
          className="w-[52px] h-[52px] items-center justify-center"
          style={{ backgroundColor: appTheme.primary }}
        >
          <Text style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 26, lineHeight: 28 }}>
            +
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
