// Core
import { Text, View } from "react-native";

// Hooks
import { useApptheme } from "@/lib/context/theme.context";
import { WorkSchedule } from "@/lib/utils/interfaces";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { Switch } from "react-native-switch";

export default function WorkScheduleStack({
  item,
  index,
  toggleDay,
  removeSlot,
  addSlot,
  dropdown,
  setDropdown,
  isTogglingDay
}: {
  item: WorkSchedule;
  index: number;
  toggleDay: (index: number) => void;
  removeSlot: (index: number, slotIndex: number) => void;
  addSlot: (index: number) => void;
  dropdown: {
    dayIndex: number;
    slotIndex: number;
    type: "start" | "end";
  } | null;
  setDropdown: Dispatch<
    SetStateAction<{
      dayIndex: number;
      slotIndex: number;
      type: "start" | "end";
    } | null>
  >;
  isTogglingDay: number;
}) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={() => setDropdown(null)}
      className="p-4 my-2"
      style={{
        backgroundColor: appTheme.white,
        borderWidth: 2,
        borderColor: appTheme.horizontalLine,
      }}
    >
      {/* Day Header with Toggle */}
      <View className="flex-row justify-between items-center">
        <Text
          style={{
            color: appTheme.fontMainColor,
            fontFamily: "Anton",
            fontSize: 17,
            textTransform: "uppercase",
          }}
        >
          {t(item.day)}
        </Text>
        <Switch
          value={item.times.some((t) => !!t)}
          onValueChange={() => toggleDay(index)}
          activeText={""}
          inActiveText={""}
          circleSize={25}
          barHeight={25}
          backgroundActive={appTheme.primary}
          backgroundInactive={appTheme.gray}
          circleBorderWidth={0}
          disabled={isTogglingDay !== index && isTogglingDay !== -1}
        />
      </View>

      {/* Time Slots */}
      {item.times.some((t) => !!t) && (
        <View className="mt-2">
          {item.times.map((slot, slotIndex) => {
            const isStartTapped =
              dropdown?.dayIndex === index &&
              dropdown?.slotIndex === slotIndex &&
              dropdown?.type === "start";
            const isEndTapped =
              dropdown?.dayIndex === index &&
              dropdown?.slotIndex === slotIndex &&
              dropdown?.type === "end";

            return (
              <View
                key={slotIndex}
                className="flex-row items-center justify-between mt-2 gap-x-2"
              >
                {/* Start Time Button */}
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() =>
                    setDropdown({
                      dayIndex: index,
                      slotIndex,
                      type: "start",
                    })
                  }
                  className="w-[40%] p-2"
                  style={{
                    borderWidth: 2,
                    borderColor: isStartTapped
                      ? appTheme.primary
                      : appTheme.horizontalLine,
                    backgroundColor: appTheme.white,
                  }}
                >
                  <Text
                    className="text-center"
                    style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800" }}
                  >
                    {slot.startTime.join(":")}
                  </Text>
                </TouchableOpacity>

                <Text style={{ color: appTheme.fontMainColor }}>-</Text>

                {/* End Time Button */}
                <TouchableOpacity
                  onPress={() =>
                    setDropdown({
                      dayIndex: index,
                      slotIndex,
                      type: "end",
                    })
                  }
                  className="w-[40%] p-2"
                  style={{
                    borderWidth: 2,
                    borderColor: isEndTapped
                      ? appTheme.primary
                      : appTheme.horizontalLine,
                    backgroundColor: appTheme.white,
                  }}
                >
                  <Text
                    className="text-center"
                    style={{ color: appTheme.fontMainColor, fontFamily: "Archivo800" }}
                  >
                    {slot.endTime.join(":")}
                  </Text>
                </TouchableOpacity>

                {/* Remove Slot Button */}
                {item.times.length > 1 && slotIndex !== 0 && (
                  <TouchableOpacity
                    onPress={() => removeSlot(index, slotIndex)}
                    className="w-8 h-8 justify-center items-center"
                    style={{ borderWidth: 2, borderColor: appTheme.primary }}
                  >
                    <Text style={{ color: appTheme.primary, fontWeight: "800" }}>
                      −
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Add Slot Button */}
                {slotIndex === 0 && (
                  <TouchableOpacity
                    onPress={() => addSlot(index)}
                    className="w-8 h-8 justify-center items-center"
                    style={{
                      backgroundColor: appTheme.primary,
                    }}
                  >
                    <Text style={{ color: appTheme.white, fontWeight: "800" }}>
                      +
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}
