import React, { useContext } from 'react'
import { Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
  Time
} from 'react-native-gifted-chat'
import { useChatScreen } from './useChatScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { callNumber } from '../../utils/callNumber'
import ConfigurationContext from '../../context/Configuration'
import styles from './styles'

const QUICK_REPLIES = ['At the gate', 'At door', 'Call me']

const ChatScreen = ({ navigation, route }) => {
  const configuration = useContext(ConfigurationContext)
  const {
    messages,
    onSend,
    sendMessage,
    inputMessage,
    setInputMessage,
    profile,
    orderNo,
    total,
    riderName,
    riderPhone
  } = useChatScreen({ navigation, route })

  const { t } = useTranslation()

  const renderQuickReplies = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles().quickRepliesContainer}
    >
      {QUICK_REPLIES.map((reply) => (
        <TouchableOpacity
          key={reply}
          onPress={() => sendMessage(t(reply))}
          style={styles().quickReplyChip}
        >
          <Text style={styles().quickReplyText}>{t(reply)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  const renderInputToolbar = (props) => {
    return (
      <View style={styles().toolbarWrapper}>
        {renderQuickReplies()}
        <InputToolbar {...props} containerStyle={styles().inputToolbar} />
      </View>
    )
  }

  const renderActions = () => (
    <View style={styles().actionButton}>
      <Ionicons name='add' size={22} color='#FFF' />
    </View>
  )

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        sendButtonProps={{
          ...props,
          onPress: () => inputMessage?.trim() && onSend()
        }}
        disabled={!inputMessage?.trim()}
        containerStyle={styles().sendButton}
      >
        <Ionicons name='send' size={16} color='#FFF' />
      </Send>
    )
  }

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        renderUsername={props.position === 'left' ? undefined : () => null}
        wrapperStyle={{
          right: { backgroundColor: 'transparent' },
          left: { backgroundColor: 'transparent' }
        }}
        usernameStyle={styles().username}
        textStyle={{
          right: styles().bubbleTextRight,
          left: styles().bubbleTextLeft
        }}
      />
    )
  }

  const renderTime = (props) => {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: styles().timeText,
          right: styles().timeText
        }}
      />
    )
  }

  return (
    <View style={styles().chatSec}>
      <SafeAreaView style={styles().header}>
        <View style={styles().headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles().headerIconOutlined}
          >
            <Ionicons name='close' size={16} color='#FFF' />
          </TouchableOpacity>
          <Text style={styles().headerTitle}>{t('contactYourRider')}</Text>
          <TouchableOpacity
            onPress={() => callNumber(riderPhone)}
            style={styles().headerIconFilled}
          >
            <Ionicons name='call' size={16} color='#FFF' />
          </TouchableOpacity>
        </View>
        <View style={styles().orderRow}>
          <Text style={styles().orderLabel}>{t('OrderNo')}</Text>
          <View style={styles().orderBadge}>
            <Text style={styles().orderBadgeText}>{orderNo}</Text>
          </View>
          <Text style={styles().totalAmount}>
            {configuration?.currencySymbol}
            {total}
          </Text>
        </View>
      </SafeAreaView>

      {!!riderName && (
        <View style={styles().riderBar}>
          <View style={styles().riderDot} />
          <Text style={styles().riderName} numberOfLines={1}>
            {riderName}
          </Text>
        </View>
      )}

      <GiftedChat
        messages={messages}
        user={{
          _id: profile?._id
        }}
        alwaysShowSend
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderActions={renderActions}
        renderTime={renderTime}
        scrollToBottom
        inverted={Platform.OS !== 'web' || messages.length === 0}
        renderAvatar={null}
        renderUsernameOnMessage
        placeholder={t('replyRider')}
        textInputProps={{
          style: styles().composer,
          placeholderTextColor: '#8A8A8A'
        }}
        renderInputToolbar={renderInputToolbar}
        text={inputMessage ?? ''}
        onInputTextChanged={(m) => setInputMessage(m)}
        messagesContainerStyle={styles().messagesContainer}
      />
    </View>
  )
}

export default ChatScreen
