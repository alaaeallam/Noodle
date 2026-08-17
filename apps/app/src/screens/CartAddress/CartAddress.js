import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { View, TouchableOpacity, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EvilIcons, MaterialIcons, Entypo, Foundation } from '@expo/vector-icons'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { scale } from '../../utils/scaling'
import RadioButton from '../../ui/FdRadioBtn/RadioBtn'
import UserContext from '../../context/User'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { selectAddress } from '../../apollo/mutations'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { LocationContext } from '../../context/Location'
import { HeaderBackButton } from '@react-navigation/elements'
import analytics from '../../utils/analytics'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import useLocation from '../../ui/hooks/useLocation'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'

import useNetworkStatus from '../../utils/useNetworkStatus'
import ErrorView from '../../components/ErrorView/ErrorView'

const SELECT_ADDRESS = gql`
  ${selectAddress}
`

const ADDRESS_ICONS = {
  Home: (color) => <Entypo name='home' size={scale(18)} color={color} />,
  Work: (color) => <MaterialIcons name='work' size={scale(18)} color={color} />
}
const addressIcon = (label, color) => (ADDRESS_ICONS[label] ? ADDRESS_ICONS[label](color) : <Foundation name='marker' size={scale(20)} color={color} />)

function CartAddresses(props) {
  const Analytics = analytics()
  const { t, i18n } = useTranslation()
  const inset = useSafeAreaInsets()
  const { location, setLocation } = useContext(LocationContext)
  const { profile } = useContext(UserContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = { isRTL : i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue] }
  const [mutate] = useMutation(SELECT_ADDRESS, { onError })
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [tempSelectedAddress, setTempSelectedAddress] = useState(null)
  const [defaultAddress, setDefaultAddress] = useState(null)
  const [isAddressChanged, setIsAddressChanged] = useState(false)
  const { getCurrentLocation } = useLocation()
  const [locatingMe, setLocatingMe] = useState(false)

  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: '',
      headerRight: null,
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0,
        shadowOpacity: 0
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=""
          backImage={() => (
            <View>
              <MaterialIcons name="arrow-back" size={30} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props.navigation])
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_CARTADDRESS)
    }
    Track()
  }, [])

  useEffect(() => {
    if (profile?.addresses) {
      // Find the last saved address
      const lastSavedAddress = profile?.addresses?.slice().reverse().find(address => address.selected)
      if (lastSavedAddress) {
        setSelectedAddress(lastSavedAddress)
        setTempSelectedAddress(lastSavedAddress)
        setDefaultAddress(lastSavedAddress)
        setLocation({
          _id: lastSavedAddress._id,
          label: lastSavedAddress.label,
          latitude: Number(lastSavedAddress.location.coordinates[1]),
          longitude: Number(lastSavedAddress.location.coordinates[0]),
          deliveryAddress: lastSavedAddress.deliveryAddress,
          details: lastSavedAddress.details
        })
      }
    }
  }, [profile, setLocation])

  function onError(error) {
    console.log(error)
  }

  const onSelectAddress = address => {
    setTempSelectedAddress(address)
    setIsAddressChanged(defaultAddress ? address._id !== defaultAddress._id : true)
  }

  const onUseCurrentLocation = async () => {
    setLocatingMe(true)
    const { coords, error } = await getCurrentLocation()
    setLocatingMe(false)
    if (error || !coords) {
      FlashMessage({ message: t('locationPermissionDenied') })
      return
    }
    props.navigation.navigate('AddNewAddress', {
      latitude: coords.latitude,
      longitude: coords.longitude,
      prevScreen: 'CartAddress'
    })
  }

  const { isConnected:connect,setIsConnected :setConnect} = useNetworkStatus();
  if (!connect) return <ErrorView refetchFunctions={[]} />

  return (
    <>
      <View style={[styles().flex, styles(currentTheme).cartAddress]}>
        <FlatList
          data={profile?.addresses?.slice().reverse()}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
          ListHeaderComponent={() => (
            <View style={styles(currentTheme).headingBlock}>
              <TextDefault uppercase bolder small textColor={currentTheme.main} style={styles().eyebrow}>
                {t('deliverTo')}
              </TextDefault>
              <TextDefault H1 bolder textColor={currentTheme.black}>
                {t('whereAreWeDroppingIt')}
              </TextDefault>
              <TextDefault textColor={currentTheme.gray500} style={styles().subtext}>
                {t('pickSavedSpot')}
              </TextDefault>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={locatingMe}
                style={styles(currentTheme).currentLocationBtn}
                onPress={onUseCurrentLocation}
              >
                <MaterialIcons name='my-location' size={scale(18)} color={currentTheme.white} />
                <TextDefault H4 bolder textColor={currentTheme.white}>
                  {locatingMe ? t('loading') : t('useMyCurrentLocation')}
                </TextDefault>
              </TouchableOpacity>
              <TextDefault uppercase bolder small textColor={currentTheme.gray500} style={styles().savedLabel}>
                {t('saved')}
              </TextDefault>
            </View>
          )}
          style={{ paddingHorizontal: scale(24) }}
          renderItem={({ item: address }) => {
            const isSelected = address._id === (tempSelectedAddress ? tempSelectedAddress._id : location._id)
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles(currentTheme).containerSpace(currentTheme), isSelected && styles(currentTheme).containerSpaceSelected(currentTheme)]}
                onPress={() => {
                  onSelectAddress(address)
                }}
              >
                <View style={styles(currentTheme).addressIconBox}>
                  {addressIcon(address.label, currentTheme.black)}
                </View>
                <View style={styles(currentTheme).addressTextBlock}>
                  <TextDefault
                    textColor={currentTheme.black}
                    H5
                    bolder
                    isRTL
                  >
                    {t(address.label)}
                  </TextDefault>
                  <TextDefault
                    numberOfLines={2}
                    textColor={currentTheme.gray500}
                    small
                    isRTL
                  >
                    {address.deliveryAddress}
                  </TextDefault>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles().editBtn}
                  onPress={() => {
                    const [longitude, latitude] =
                      address.location.coordinates
                    props.navigation.navigate('AddNewAddress', {
                      longitude: +longitude,
                      latitude: +latitude,
                      prevScreen: 'CartAddress'
                    })
                  }}
                >
                  <EvilIcons
                    name='pencil'
                    size={scale(25)}
                    color={currentTheme.gray500}
                  />
                </TouchableOpacity>
                <RadioButton
                  size={14}
                  outerColor={currentTheme.borderColor}
                  innerColor={currentTheme.main}
                  isSelected={isSelected}
                  onPress={() => {
                    onSelectAddress(address)
                  }}
                />
              </TouchableOpacity>
            )
          }}
        />
        <View>
          <View style={styles(currentTheme).containerButton}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles(currentTheme).addButton}
              onPress={() => {
                const latitude = location.latitude
                const longitude = location.longitude
                props.navigation.navigate('AddNewAddress', {
                  longitude: +longitude,
                  latitude: +latitude,
                  prevScreen: 'CartAddress'
                })
                setIsAddressChanged(true)
              }}
            >
              <TextDefault uppercase H4 bolder textColor={currentTheme.black}>
                {t('addAddress')}
              </TextDefault>
            </TouchableOpacity>
          </View>
          {tempSelectedAddress && (
            <View style={styles(currentTheme).containerButton}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles(currentTheme).continueButton}
                onPress={() => {
                  setLocation({
                    _id: tempSelectedAddress._id,
                    label: tempSelectedAddress.label,
                    latitude: Number(tempSelectedAddress.location.coordinates[1]),
                    longitude: Number(tempSelectedAddress.location.coordinates[0]),
                    deliveryAddress: tempSelectedAddress.deliveryAddress,
                    details: tempSelectedAddress.details
                  })
                  mutate({ variables: { id: tempSelectedAddress._id } })
                  setSelectedAddress(tempSelectedAddress)
                  props.navigation.navigate('Checkout', {
                    longitude: +location.longitude,
                    latitude: +location.latitude,
                    prevScreen: 'CartAddress'
                  })
                }}
              >
                <TextDefault uppercase H4 bolder textColor={currentTheme.white}>
                  {t('continueToTheBurgers')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  )
}

export default CartAddresses
