import React, { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'


const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)

  const setTokenAsync = async token => {
    await SecureStore.setItemAsync('token', token)
    setToken(token)
  }

  useEffect(() => {
    let isSubscribed = true
    ;(async() => {
      const token = await SecureStore.getItemAsync('token')
      isSubscribed && setToken(token)
    })()
    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ token, setToken, setTokenAsync}}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthConsumer = AuthContext.Consumer
export default AuthContext
