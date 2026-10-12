import React, { useEffect, useContext } from 'react'
import { AppState } from 'react-native'
import { useApolloClient, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { myOrders } from '../apollo/queries'
import { orderStatusChanged } from '../apollo/subscriptions'
import UserContext from './User'

const ORDERS = gql`
  ${myOrders}
`
const SUBSCRIPTION_ORDERS = gql`
  ${orderStatusChanged}
`

const OrdersContext = React.createContext()

export const OrdersProvider = ({ children }) => {
  const client = useApolloClient()
  const { profile } = useContext(UserContext)
  const {
    called: calledOrders,
    loading: loadingOrders,
    error: errorOrders,
    data: dataOrders,
    previousData: previousDataOrders,
    networkStatus: networkStatusOrders,
    fetchMore: fetchMoreOrders,
    refetch: reFetchOrders,
    subscribeToMore: subscribeToMoreOrders
  } = useQuery(ORDERS, {
    fetchPolicy: 'network-only',
    onError,
    // pollInterval:2000,
    skip: !profile
  })

  function onError(error) {
    console.log('error context orders', error?.message)
  }

  useEffect(() => {
    if (!profile) return
    subscribeOrders()
  }, [profile])

  // iOS suspends the app (and drops its websocket) while it's in the
  // background, and status events published meanwhile are not replayed on
  // reconnect - e.g. the store accepting an order while the customer is in
  // another app left this screen stuck on "waiting for the store" with the
  // cancel button still showing. Refetch whenever the app comes back.
  useEffect(() => {
    if (!profile) return
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') reFetchOrders().catch(() => {})
    })
    return () => sub.remove()
  }, [profile])

  const subscribeOrders = () => {
    try {
      const unsubscribeOrders = subscribeToMoreOrders({
        document: SUBSCRIPTION_ORDERS,
        variables: { userId: profile?._id },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData?.data) return prev
          const { _id } = subscriptionData?.data?.orderStatusChanged?.order
          if (subscriptionData?.data?.orderStatusChanged?.origin === 'new') {
            if (prev?.orders?.findIndex(o => o?._id === _id) > -1) return prev
            return {
              orders: [
                subscriptionData?.data?.orderStatusChanged?.order,
                ...prev.orders
              ]
            }
          } else if (subscriptionData?.data?.orderStatusChanged?.origin === 'update') {
            return {
              orders: [
                ...prev.orders.filter((order) => order?._id !== subscriptionData?.data?.orderStatusChanged?.order?._id),
                subscriptionData?.data?.orderStatusChanged?.order
              ]
            }
          }
          return prev
        }
      })
      client.onResetStore(unsubscribeOrders)
    } catch (error) {
      console.log('error subscribing order', error?.message)
    }
  }

  const fetchMoreOrdersFunc = () => {
    if (networkStatusOrders === 7) {
      fetchMoreOrders({
        variables: { offset: dataOrders?.orders?.length + 1 }
      })
    }
  }

  return (
    <OrdersContext.Provider
      value={{
        loadingOrders: loadingOrders && calledOrders,
        errorOrders,
        // Keep showing the last good list if a refetch fails (data is
        // cleared on error, e.g. when iOS resumes before the network is up).
        orders: (dataOrders ?? previousDataOrders)?.orders ?? [],
        reFetchOrders,
        fetchMoreOrdersFunc,
        networkStatusOrders
      }}>
      {children}
    </OrdersContext.Provider>
  )
}

export const OrdersConsumer = OrdersContext.Consumer
export default OrdersContext
