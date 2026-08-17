/* eslint-disable react/display-name */
import React, { useRef, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { View, TouchableOpacity, StatusBar, Platform, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import { useMutation, useQuery, gql } from '@apollo/client'
import { useLocation, useCurrentStore } from '../../ui/hooks'
import UserContext from '../../context/User'
import { restaurantListPreview, allStoresList, getBanners } from '../../apollo/queries'
import { selectAddress } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import HomeTopBar from '../../components/Main/HomeTopBar/HomeTopBar'
import Banner from '../../components/Main/Banner/Banner'
import FeaturedBanner from '../../components/Main/FeaturedBanner/FeaturedBanner'
import StoreStrip from '../../components/Main/StoreStrip/StoreStrip'
import ResumeCart from '../../components/Main/ResumeCart/ResumeCart'
import WholeMenu from '../../components/Main/WholeMenu/WholeMenu'
import StoreSwitcherModal from '../../components/Main/StoreSwitcher/StoreSwitcherModal'
import CategoryChips from '../../components/Main/CategoryChips/CategoryChips'
import ReorderRail from '../../components/Main/ReorderRail/ReorderRail'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import ErrorView from '../../components/ErrorView/ErrorView'
import ActiveOrders from '../../components/Main/ActiveOrders/ActiveOrders'
import Spinner from '../../components/Spinner/Spinner'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import useGeocoding from '../../ui/hooks/useGeocoding'
import ForceUpdate from '../../components/Update/ForceUpdate'
import { flattenMenu, getFeaturedItems, getTodayClosingTime } from '../../utils/homeMenu'

import useNetworkStatus from '../../utils/useNetworkStatus'
import ModalDropdown from '../../components/Picker/ModalDropdown'

const RESTAURANTS = gql`
  ${restaurantListPreview}
`
// Unbounded list for the store switcher — restaurantorders (below) is
// delivery-bounds-restricted, so it only ever contains the store(s) that
// deliver to the customer's current address, which broke "switch store"
// when the customer only had one store in range.
const ALL_STORES = gql`
  ${allStoresList}
`
const BANNERS = gql`
  ${getBanners}
`
const SELECT_ADDRESS = gql`
  ${selectAddress}
`

function Main(props) {
  const Analytics = analytics()

  const { t, i18n } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { isLoggedIn, profile, cartCount, restaurant: cartRestaurantId, clearCart } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMenuCategory, setSelectedMenuCategory] = useState(null)
  const modalRef = useRef(null)
  const storeSwitcherRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const { getCurrentLocation } = useLocation()
  const { getAddress } = useGeocoding()
  const { isConnected: connect, setIsConnected: setConnect } = useNetworkStatus()

  const locationData = location
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const [citiesModalVisible, setCitiesModalVisible] = useState(false)
  const {
    data,
    loading,
    error,
    refetch: refetchRestaurants
  } = useQuery(RESTAURANTS, {
    variables: {
      longitude: location?.longitude || null,
      latitude: location?.latitude || null,
      shopType: null,
      ip: null
    },
    fetchPolicy: 'network-only'
  })

  function onError(error) {
    console.log(error)
  }
  const [mutate] = useMutation(SELECT_ADDRESS, {
    onError
  })

  const handleActiveOrdersChange = (activeOrdersExist) => {
    setHasActiveOrders(activeOrdersExist)
  }
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchRestaurants()
    if (refetchCurrentStore) await refetchCurrentStore()
    setIsRefreshing(false)
  }
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.headerBackground)
      }
      StatusBar.setBarStyle('light-content')
    }, [currentTheme])
  )
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])
  const onOpen = () => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const setAddressLocation = async (address) => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    mutate({ variables: { id: address._id } })
    modalRef.current.close()
  }

  const setCurrentLocation = async () => {
    setBusy(true)

    const { error, coords } = await getCurrentLocation()

    if (!coords || !coords.latitude || !coords.longitude) {
      console.error('Invalid coordinates:', coords)
      setBusy(false)
      return
    }

    try {
      const { formattedAddress } = await getAddress(coords.latitude, coords.longitude)

      let address = formattedAddress || 'Unknown Address'

      if (address.length > 21) {
        address = address.substring(0, 21) + '...'
      }

      if (error) {
        navigation.navigate('SelectLocation')
      } else {
        modalRef.current?.close()
        setLocation({
          label: 'currentLocation',
          latitude: coords.latitude,
          longitude: coords.longitude,
          deliveryAddress: address
        })
        setBusy(false)
      }
    } catch (fetchError) {
      console.error('Error fetching address using Google Maps API:', fetchError.message)
    }
  }

  const handleMarkerPress = async (coordinates) => {
    setCitiesModalVisible(false)
    const response = await getAddress(coordinates.latitude, coordinates.longitude)
    setLocation({
      label: 'Location',
      deliveryAddress: response.formattedAddress,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      city: response.city
    })
    setTimeout(() => {
      reloadScreen()
    }, 100)
  }

  const reloadScreen = () => {
    navigation.navigate('Discovery', {
      refresh: Date.now()
    })
  }

  const modalHeader = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity style={[styles(currentTheme).addButton]} activeOpacity={0.7} onPress={setCurrentLocation} disabled={busy}>
          <View style={styles(currentTheme).addressSubContainer}>
            {busy ? (
              <Spinner size='small' />
            ) : (
              <>
                <SimpleLineIcons name='target' size={scale(18)} color={currentTheme.black} />
                <View style={styles().mL5p} />
                <TextDefault bold textColor={currentTheme.black}>
                  {t('currentLocation')}
                </TextDefault>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  const modalFooter = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={[styles(currentTheme).addressContainer]}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', {
                prevScreen: 'Main',
                ...locationData
              })
            } else {
              const modal = modalRef.current
              modal?.close()
              props?.navigation.navigate({
                name: 'CreateAccount'
              })
            }
          }}
        >
          <View style={styles(currentTheme).addressSubContainer}>
            <AntDesign name='pluscircleo' size={scale(20)} color={currentTheme.black} />
            <View style={styles().mL5p} textColor={currentTheme.black} />
            <TextDefault bold textColor={currentTheme.black}>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )

  const restaurantorders = data?.nearByRestaurantsPreview?.restaurants?.filter((restaurant) => restaurant.shopType === 'restaurant')

  const { data: allStoresData } = useQuery(ALL_STORES, { fetchPolicy: 'cache-and-network' })
  const allSwitcherStores = allStoresData?.restaurantList?.filter((restaurant) => restaurant.shopType === 'restaurant') ?? restaurantorders

  const { data: bannersData } = useQuery(BANNERS, { fetchPolicy: 'cache-and-network' })

  const deliveryAddressText = location?.deliveryAddress === 'Current Location' ? t('currentLocation') : location?.deliveryAddress

  const onPressCart = () => {
    if (cartCount > 0) {
      navigation.navigate('Cart')
    } else {
      FlashMessage({ message: t('cartIsEmpty') })
    }
  }

  // "Current store" — nearest BTB location out of restaurantorders, or
  // whichever the user picked via the store switcher. See useCurrentStore.
  const { currentStore, currentStoreId, loadingCurrentStore, refetchCurrentStore, switchStore } = useCurrentStore(restaurantorders, allSwitcherStores)

  const menuCategoryChipData = useMemo(
    () => (currentStore?.categories || []).map((c) => ({ _id: c._id, name: c.title })),
    [currentStore]
  )

  const wholeMenuItems = useMemo(() => {
    const items = flattenMenu(currentStore)
    return selectedMenuCategory ? items.filter((item) => item.categoryTitle === selectedMenuCategory.name) : items
  }, [currentStore, selectedMenuCategory])

  const featuredItems = useMemo(() => getFeaturedItems(currentStore), [currentStore])
  const closingTime = useMemo(() => getTodayClosingTime(currentStore), [currentStore])

  const onPressMenuItem = (food) => {
    const openItemDetail = () => {
      navigation.navigate('ItemDetail', {
        food,
        addons: currentStore?.addons || [],
        options: currentStore?.options || [],
        restaurant: currentStore?._id
      })
    }
    if (!cartRestaurantId || cartRestaurantId === currentStore?._id) {
      openItemDetail()
    } else {
      Alert.alert(
        '',
        t('clearCartText'),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('okText'),
            onPress: async () => {
              await clearCart()
              openItemDetail()
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  // Must stay below every hook call (including useCurrentStore/useMemo above)
  // — an early return before them would be a Rules-of-Hooks violation
  // ("Rendered fewer hooks than expected") since the number of hooks called
  // must never depend on a condition.
  if (error) return <ErrorView />

  return (
    <>
      {!connect ? (
        <ErrorView refetchFunctions={[refetchRestaurants]} />
      ) : (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles().flex}>
          <View style={[styles().flex, styles(currentTheme).screenBackground]}>
            {loading || loadingCurrentStore ? (
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <ActivityIndicator size='large' color={currentTheme.spinnerColor} />
              </View>
            ) : restaurantorders?.length > 0 ? (
              <ScrollView style={styles().flex} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
                <HomeTopBar
                  currentTheme={currentTheme}
                  address={deliveryAddressText}
                  onPressAddress={onOpen}
                  cartCount={cartCount}
                  onPressCart={onPressCart}
                />
                {currentStore && (
                  <StoreStrip
                    currentTheme={currentTheme}
                    storeName={currentStore.name}
                    distanceKm={currentStore.distanceWithCurrentLocation}
                    closingTime={closingTime}
                    onPressSwitch={() => storeSwitcherRef.current?.open()}
                  />
                )}
                <FeaturedBanner
                  currentTheme={currentTheme}
                  storeName={currentStore?.name}
                  featuredItems={featuredItems}
                  onPressAddToBag={onPressMenuItem}
                />
                <View style={{ gap: 18, paddingTop: scale(4) }}>
                  <ResumeCart currentTheme={currentTheme} />

                  {isLoggedIn && <ReorderRail />}

                  <Banner banners={bannersData?.banners} />

                  <CategoryChips currentTheme={currentTheme} cuisines={menuCategoryChipData} selectedCuisine={selectedMenuCategory} onSelect={setSelectedMenuCategory} allLabel={t('yourUsual')} />

                  <WholeMenu currentTheme={currentTheme} items={wholeMenuItems} onPressItem={onPressMenuItem} />
                </View>
              </ScrollView>
            ) : !location ? (
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <Spinner backColor='transparent' />
              </View>
            ) : (
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                <TextDefault bold H4 style={{ textAlign: 'center', marginBottom: 4 }}>
                  {t('We are currently not available in your location.')}
                </TextDefault>
                <TextDefault style={{ textAlign: 'center', marginBottom: 10 }}>{t('Please check back later or try a different location.')}</TextDefault>

                <TouchableOpacity activeOpacity={0.7} onPress={() => setCitiesModalVisible(true)} style={[styles(currentTheme).button, { opacity: 1 }]}>
                  <TextDefault textColor={currentTheme.color4} style={{ paddingHorizontal: 10 }} bold H7>
                    {t('Select different location')}
                  </TextDefault>
                </TouchableOpacity>
              </View>
            )}
            <ForceUpdate />
            <ActiveOrders onActiveOrdersChange={handleActiveOrdersChange} />

            <MainModalize modalRef={modalRef} currentTheme={currentTheme} isLoggedIn={isLoggedIn} addressIcons={addressIcons} modalHeader={modalHeader} modalFooter={modalFooter} setAddressLocation={setAddressLocation} profile={profile} location={location} />
            <StoreSwitcherModal modalRef={storeSwitcherRef} currentTheme={currentTheme} stores={allSwitcherStores} currentStoreId={currentStoreId} onSelect={switchStore} />
            <ModalDropdown theme={currentTheme} visible={citiesModalVisible} onItemPress={handleMarkerPress} onClose={() => setCitiesModalVisible(false)} />
          </View>
        </SafeAreaView>
      )}
    </>
  )
}

export default Main
