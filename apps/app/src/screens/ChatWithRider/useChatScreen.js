import { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import { chat } from '../../apollo/queries'
import { subscriptionNewMessage } from '../../apollo/subscriptions'
import { sendChatMessage } from '../../apollo/mutations'
import { useMutation, useQuery } from '@apollo/client'
import { Alert, Platform, StatusBar } from 'react-native'
import { useUserContext } from '../../context/User'
import { useFocusEffect } from '@react-navigation/native'

export const useChatScreen = ({ route }) => {
  const { id: orderId, orderNo, total, riderPhone, riderName } = route.params

  const { profile } = useUserContext()
  const { subscribeToMore: subscribeToMessages, data: chatData } = useQuery(
    gql`
      ${chat}
    `,
    {
      variables: { order: orderId },
      fetchPolicy: 'network-only',
      onError
    }
  )
  const [send] = useMutation(
    gql`
      ${sendChatMessage}
    `,
    {
      onCompleted,
      onError
    }
  )
  useEffect(() => {
    if (chatData) {
      setMessages(
        chatData.chat.map(message => ({
          _id: message.id,
          text: message.message,
          createdAt: message.createdAt,
          user: {
            _id: message.user.id,
            name: message.user.name
          }
        }))
      )
    }
  }, [chatData])

  function onCompleted({ sendChatMessage: messageResult }) {
    if (!messageResult?.success) {
      Alert.alert('Error', messageResult.message)
    }
  }
  function onError(error) {
    Alert.alert('Error', error.message)
  }
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState(null)
  const [image, setImage] = useState([])
  // Header/chrome for this screen is always the BTB black bar, regardless
  // of system light/dark mode, so the status bar text is always light.
  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#0A0A0A')
    }
    StatusBar.setBarStyle('light-content')
  })
  // No deps array here would resubscribe on every render (every keystroke
  // in the composer, every message sent) - Apollo tears down and
  // re-establishes the websocket subscription each time, which meant new
  // messages very often arrived during a dead window and never rendered.
  useEffect(() => {
    if (!orderId) return
    const unsubscribe = subscribeToMessages({
      document: gql`
        ${subscriptionNewMessage}
      `,
      variables: { order: orderId },

      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        return {
          chat: [subscriptionData.data.subscriptionNewMessage, ...prev.chat]
        }
      }
    })
    return unsubscribe
  }, [orderId])
  const sendMessage = text => {
    if (!text?.trim()) return

    const newMessage = {
      _id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date(),
      user: {
        _id: profile._id,
        name: profile.name
      }
    }

    // Optimistically update messages
    setMessages(previousMessages => [newMessage, ...previousMessages])

    send({
      variables: {
        orderId: orderId,
        messageInput: {
          message: text.trim(),
          user: {
            id: profile._id,
            name: profile.name
          }
        }
      }
    })
  }

  const onSend = () => {
    sendMessage(inputMessage)
    setInputMessage('')
    setImage([])
  }

  return {
    messages,
    onSend,
    sendMessage,
    image,
    setImage,
    inputMessage,
    setInputMessage,
    profile,
    orderNo,
    total,
    riderName,
    riderPhone
  }
}
