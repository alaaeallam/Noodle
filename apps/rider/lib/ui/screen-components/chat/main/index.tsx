// Core
import { Platform, StyleSheet, View } from "react-native";

// Gifted Chat
import { useApptheme } from "@/lib/context/global/theme.context";
import { useChatScreen } from "@/lib/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  Send,
  Time,
  BubbleProps,
  InputToolbarProps,
  SendProps,
  TimeProps,
  IMessage,
} from "react-native-gifted-chat";

// Components
import QuickReplies from "../quick-replies";

export default function ChatMain() {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const {
    messages,
    onSend,
    sendMessage,
    inputMessage,
    setInputMessage,
    profile,
  } = useChatScreen();

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <View style={{ backgroundColor: appTheme.screenBackground }}>
        <QuickReplies onSelect={sendMessage} />
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: appTheme.black,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        />
      </View>
    );
  };

  const renderActions = () => {
    return (
      <View
        className="items-center justify-center"
        style={{
          width: 40,
          height: 40,
          marginRight: 6,
          marginBottom: 2,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.34)",
        }}
      >
        <Ionicons name="add" size={22} color={appTheme.white} />
      </View>
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send
        {...props}
        sendButtonProps={{
          ...props,
          onPress: () => {
            if (inputMessage?.trim()) onSend();
          },
        }}
        disabled={!inputMessage?.trim()}
        containerStyle={{
          width: 40,
          height: 40,
          marginLeft: 6,
          marginBottom: 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: appTheme.primary,
        }}
      >
        <Ionicons name="send" size={16} color={appTheme.white} />
      </Send>
    );
  };

  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        renderUsername={props.position === "left" ? undefined : () => null}
        wrapperStyle={{
          right: { backgroundColor: "transparent" },
          left: { backgroundColor: "transparent" },
        }}
        usernameStyle={{
          color: appTheme.fontSecondColor,
          fontFamily: "Archivo800",
          fontSize: 11,
          marginBottom: 2,
        }}
        textStyle={{
          right: {
            ...styles.bubbleText,
            color: appTheme.white,
            backgroundColor: appTheme.primary,
          },
          left: {
            ...styles.bubbleText,
            color: appTheme.fontMainColor,
            backgroundColor: appTheme.white,
            borderWidth: 2,
            borderColor: appTheme.borderLineColor,
            borderLeftWidth: 5,
            borderLeftColor: appTheme.black,
          },
        }}
      />
    );
  };

  const renderTime = (props: TimeProps<IMessage>) => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: {
            color: appTheme.fontSecondColor,
            fontSize: 11,
            marginLeft: 2,
          },
          right: {
            color: appTheme.fontSecondColor,
            fontSize: 11,
            marginRight: 2,
          },
        }}
      />
    );
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: appTheme.screenBackground }}
    >
      <GiftedChat
        messages={messages}
        user={{
          _id: profile?._id ?? "",
          name: profile?.name,
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderActions={renderActions}
        renderTime={renderTime}
        renderInputToolbar={renderInputToolbar}
        alwaysShowSend
        scrollToBottom
        renderAvatar={null}
        renderUsernameOnMessage
        inverted={Platform.OS !== "web" || messages.length === 0}
        placeholder={t("Send a reply to customer!")}
        text={inputMessage ?? ""}
        messagesContainerStyle={{
          backgroundColor: appTheme.screenBackground,
          paddingHorizontal: 4,
        }}
        textInputProps={{
          style: [
            styles.composer,
            {
              backgroundColor: appTheme.white,
              color: appTheme.fontMainColor,
            },
          ],
          placeholderTextColor: appTheme.fontSecondColor,
        }}
        onInputTextChanged={(m) => setInputMessage(String(m ?? ""))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleText: {
    fontFamily: "Archivo700",
    fontSize: 15,
    lineHeight: 20,
    padding: 10,
  },
  composer: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Archivo700",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    alignSelf: "center",
  },
});
