import { View, Alert, StatusBar, Platform, Dimensions, KeyboardAvoidingView, TextInput } from 'react-native'
import styles from './styles'
import RadioComponent from '../../components/CustomizeComponents/RadioComponent/RadioComponent'
import TitleComponent from '../../components/CustomizeComponents/TitleComponent/TitleComponent'
import CartComponent from '../../components/CustomizeComponents/CartComponent/CartComponent'
import HeadingComponent from '../../components/CustomizeComponents/HeadingComponent/HeadingComponent'
import ImageHeader from '../../components/CustomizeComponents/ImageHeader/ImageHeader'
import FrequentlyBoughtTogether from '../../components/ItemDetail/Section'
import Options from './Options'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import { MaterialIcons } from '@expo/vector-icons'
import navigationService from '../../routes/navigationService'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import UserContext from '../../context/User'
import ConfigurationContext from '../../context/Configuration'
import useNetworkStatus from '../../utils/useNetworkStatus'
import ErrorView from '../../components/ErrorView/ErrorView'
import TextDefault from '../../components/Text/TextDefault/TextDefault'

// Hooks
import React, { useState, useContext, useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, useAnimatedRef } from 'react-native-reanimated'
import { IconButton } from 'react-native-paper'
import { Text } from 'react-native'
import { scale } from '../../utils/scaling'

// Utils
import { truncateText } from '../../utils/customFunctions'

const { height } = Dimensions.get('window')
const TOP_BAR_HEIGHT = Math.round(height * 0.08)
const HEADER_MAX_HEIGHT = Math.round(height * 0.4)
const HEADER_MIN_HEIGHT = TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT

function ItemDetail(props) {
  const { food, addons, options, restaurant, editCartItem, postAddScreen } = props?.route?.params

  // Reached from the restaurant menu, this returns you there so you can keep
  // browsing/adding — that's the common case. Some entry points (e.g. Search)
  // aren't a "browse a menu" flow, so they can ask to land somewhere specific
  // (like Cart) instead of wherever the stack happens to go back to.
  const goAfterAdd = () => (postAddScreen ? navigation.navigate(postAddScreen) : navigation.goBack())

  // States
  const [listZindex, setListZindex] = useState(0)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
  const initialVariation = editCartItem
    ? food?.variations?.find((v) => v._id === editCartItem?.variation?._id) ?? food?.variations[0]
    : food?.variations[0]
  // Dedupe by _id before mapping — a food/addon occasionally references the
  // same addon/option id twice, which would otherwise render two list items
  // sharing a React key.
  const initialAddons = [...new Set(initialVariation?.addons || [])]?.map((fa) => {
    const addon = addons?.find((a) => a._id === fa)
    const editAddon = editCartItem?.addons?.find((ea) => ea._id === fa)
    const addonOptions = [...new Set(addon?.options || [])]?.map((ao) => {
      const option = options?.find((o) => o._id === ao)
      const isDefault = !!addon?.defaultOptions?.includes(ao)
      const checked = editCartItem ? !!editAddon?.options?.some((eo) => eo._id === ao) : isDefault
      return option && { ...option, isDefault, checked }
    })
    return {
      ...addon,
      options: addonOptions
    }
  })
  const [selectedVariation, setSelectedVariation] = useState({
    ...initialVariation,
    addons: initialAddons
  })
  const [selectedAddons, setSelectedAddons] = useState(
    initialAddons
      ?.map((addon) => ({
        _id: addon._id,
        options: addon?.options?.filter((option) => option?.checked) ?? []
      }))
      .filter((addon) => addon.options.length > 0) ?? []
  )
  const [specialInstructions, setSpecialInstructions] = useState(editCartItem?.specialInstructions ?? '')

  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const Analytics = analytics()
  const { restaurant: restaurantCart, setCartRestaurant, cart, addQuantity, addCartItem, updateCart } = useContext(UserContext)
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const inset = useSafeAreaInsets()
  const { isConnected: connect, setIsConnected: setConnect } = useNetworkStatus()
  const scrollViewRef = useAnimatedRef()
  const addonRefs = useRef({})
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    }
  })
  const animatedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [SCROLL_RANGE - 10, SCROLL_RANGE], [0, 1], Extrapolation.CLAMP)
    return {
      opacity,
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, SCROLL_RANGE], [HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, 0], Extrapolation.CLAMP)
        }
      ]
    }
  })

  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar)
    }
    StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content')
  })

  useEffect(() => {
    async function Track() {
      try {
        await Analytics.track(Analytics.events.OPENED_RESTAURANT_ITEM, {
          restaurantID: restaurant,
          foodID: food?._id,
          foodName: food?.title,
          foodRestaurantName: food?.restaurantName
        })
      } catch (error) {
        console.error('Analytics tracking failed:', error)
      }
    }
    Track()
  })
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: null,
      title: truncateText(20, food?.restaurantName),
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerTitleStyle: {
        color: currentTheme.newFontcolor
      },
      headerShadowVisible: false,
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={styles(currentTheme).backBtnContainer}>
              <MaterialIcons name='arrow-back' size={25} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [navigation])

  function scrollToError(addonId, totalAddons) {
    setTimeout(() => {
      if (addonRefs.current[addonId] && scrollViewRef.current && totalAddons > 0) {
        addonRefs.current[addonId].measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current.scrollTo({
            // Solution: Round the final value to an integer
            y: Math.round(Math.max(0, pageY - HEADER_MAX_HEIGHT)),
            animated: true
          })
        })
      }
    }, 300)
  }
  function validateButton() {
    if (!selectedVariation) return false
    const validatedAddons = []
    selectedVariation?.addons?.forEach((addon) => {
      const selected = selectedAddons?.find((ad) => ad._id === addon._id)
      if (!selected && addon?.quantityMinimum === 0) {
        validatedAddons.push(false)
      } else if (selected && selected?.options?.length >= addon?.quantityMinimum && selected?.options?.length <= addon?.quantityMaximum) {
        validatedAddons.push(false)
      } else validatedAddons.push(true)
    })
    return validatedAddons.every((val) => val === false)
  }

  async function onPressAddToCart(quantity) {
    const isValidOrder = validateOrderItem()
    if (isValidOrder) {
      Analytics.track(Analytics.events.ADD_TO_CART, {
        title: food?.title,
        restaurantName: food?.restaurantName,
        variations: food?.variations
      })
      if (editCartItem) {
        await addToCart(quantity, false)
      } else if (!restaurantCart || restaurant === restaurantCart) {
        await addToCart(quantity, restaurant !== restaurantCart)
      } else if (food?.restaurant !== restaurantCart) {
        Alert.alert(
          '',
          t('cartClearWarning'),
          [
            {
              text: t('Cancel'),
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel'
            },
            {
              text: t('okText'),
              onPress: async () => {
                await addToCart(quantity, true)
              }
            }
          ],
          { cancelable: false }
        )
      }
    }
  }

  // Add to cart
  const addToCart = async (quantity, clearFlag) => {
    const addons = selectedAddons.map((addon) => ({
      ...addon,
      options: addon?.options?.map(({ _id, isDefault }) => ({
        _id,
        isDefault
      }))
    }))

    if (editCartItem) {
      const updatedCart = cart.map((c) =>
        c.key === editCartItem.key
          ? { ...c, variation: { _id: selectedVariation?._id }, quantity, addons, specialInstructions }
          : c
      )
      await updateCart(updatedCart)
      goAfterAdd()
      return
    }

    const cartItem = clearFlag
      ? null
      : cart.find((cartItem) => {
          if (cartItem?._id === food?._id && cartItem?.variation?._id === selectedVariation?._id) {
            if (cartItem?.addons?.length === addons?.length) {
              if (addons?.length === 0) return true
              const addonsResult = addons?.every((newAddon) => {
                const cartAddon = cartItem.addons?.find((ad) => ad._id === newAddon._id)

                if (!cartAddon) return false
                const optionsResult = newAddon?.options?.every((newOption) => {
                  const cartOption = cartAddon?.options?.find((op) => op._id === newOption._id)

                  if (!cartOption) return false
                  return true
                })

                return optionsResult
              })

              return addonsResult
            }
          }
          return false
        })

    if (!cartItem) {
      await setCartRestaurant(restaurant)
      await addCartItem(food?._id, selectedVariation?._id, quantity, addons, clearFlag, specialInstructions)
    } else {
      await addQuantity(cartItem?.key, quantity)
    }
    goAfterAdd()
  }

  const onSelectVariation = (variation) => {
    if (variation?._id) {
      setSelectedVariation({
        ...variation,
        addons: variation?.addons?.map((fa) => {
          const addon = addons?.find((a) => a._id === fa)
          const addonOptions = addon?.options?.map((ao) => {
            const option = options?.find((o) => o._id === ao)
            return option && { ...option, isDefault: !!addon?.defaultOptions?.includes(ao) }
          })
          return {
            ...addon,
            options: addonOptions
          }
        })
      })
    }
  }

  async function onSelectOption(addon, option) {
    const index = selectedAddons?.findIndex((ad) => ad._id === addon._id)
    if (index > -1) {
      if (addon?.quantityMinimum === 1 && addon?.quantityMaximum === 1) {
        selectedAddons[index].options = [option]
      } else {
        const optionIndex = selectedAddons[index].options?.findIndex((opt) => opt._id === option._id)
        if (optionIndex > -1) {
          selectedAddons[index].options = selectedAddons[index].options?.filter((opt) => opt._id !== option._id)
        } else {
          selectedAddons[index].options?.push(option)
        }
        if (!selectedAddons[index].options?.length) {
          selectedAddons.splice(index, 1)
        }
      }
    } else {
      selectedAddons.push({ _id: addon._id, options: [option] })
    }
    setSelectedAddons([...selectedAddons])
  }

  const calculatePrice = useCallback(() => {
    const variation = selectedVariation.price
    let addons = 0
    selectedAddons.forEach((addon) => {
      addons += addon?.options?.reduce((acc, option) => {
        return acc + (option?.isDefault ? 0 : option?.price)
      }, 0)
    })
    return (variation + addons).toFixed(2)
  }, [selectedVariation, addons,selectedAddons])

  const calculateDiscountedPrice = useCallback(() => {
    const variation = selectedVariation.discounted
    let addons = 0
    selectedAddons.forEach((addon) => {
      addons += addon?.options?.reduce((acc, option) => {
        return acc + (option?.isDefault ? 0 : option?.price)
      }, 0)
    })
    return (variation + addons).toFixed(2)
  }, [selectedVariation, addons])

  function validateOrderItem() {
    let hasError = false
    const validatedAddons = selectedVariation?.addons?.map((addon) => {
      const selected = selectedAddons?.find((ad) => ad._id === addon._id)

      if (!selected && addon?.quantityMinimum === 0) {
        addon.error = false
      } else if (selected && selected?.options?.length >= addon?.quantityMinimum && selected?.options?.length <= addon?.quantityMaximum) {
        addon.error = false
      } else {
        addon.error = true
        if (!hasError) {
          hasError = true
          scrollToError(addon._id, selectedVariation?.addons?.length)
        }
      }
      return addon
    })
    setSelectedVariation({ ...selectedVariation, addons: validatedAddons })
    return !hasError
  }

  if (!connect) return <ErrorView />
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[styles().flex, styles(currentTheme).mainContainer]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={scrollHandler}
          style={[styles(currentTheme).scrollViewStyle, { zIndex: listZindex }]}
          scrollEventThrottle={1}
          onScrollEndDrag={(e) => {
            if (e?.nativeEvent?.contentOffset?.y >= 70) {
              setListZindex(4)
              calculatePrice()
            } else {
              setListZindex(1)
              calculatePrice()
            }
          }}
          onMomentumScrollEnd={(e) => {
            if (e?.nativeEvent?.contentOffset?.y >= 70) {
              setListZindex(4)
              calculatePrice()
            } else {
              setListZindex(1)
              calculatePrice()
            }
          }}
          contentContainerStyle={{
            // paddingTop: HEADER_MAX_HEIGHT,
            paddingBottom: scale(Math.round(height * 0.09))
          }}
        >
          <View>
            {food?.image ? <ImageHeader image={food?.image} /> : <Text>No image to display</Text>}
            <View style={styles().mainHeadingContainer}>
              <TextDefault H2 bolder textColor={currentTheme.black}>
                {food?.title}
              </TextDefault>
              {!!food?.description && (
                <TextDefault textColor={currentTheme.fontSecondColor} isRTL>
                  {food.description}
                </TextDefault>
              )}
              <View style={styles().priceRow}>
                <TextDefault H4 bolder textColor={currentTheme.primary}>
                  {configuration.currencySymbol} {calculatePrice()}
                </TextDefault>
                {calculateDiscountedPrice() > 0 && (
                  <TextDefault small bold textColor={currentTheme.fontSecondColor} style={{ textDecorationLine: 'line-through' }}>
                    {configuration.currencySymbol} {calculateDiscountedPrice()}
                  </TextDefault>
                )}
              </View>
            </View>
          </View>
          <View style={[styles(currentTheme).subContainer]}>
            <View>
              {food?.variations?.length > 1 && (
                <View key={"1223323"}>
                  <TitleComponent title={t('SelectVariation')} required status={t('Required')} />
                  <RadioComponent
                    options={food?.variations}
                    selected={selectedVariation}
                    onPress={(e) => {
                      onSelectVariation(food?.variations.find((v) => v._id === e._id))
                    }}
                    setSelectedVariation={onSelectVariation}
                    selectedVariation={selectedVariation}
                  />
                </View>
              )}
              {selectedVariation?.addons?.map((addon) => {
                const isRequired = addon?.quantityMinimum !== 0
                return (<View key={addon?._id}>
                  <TitleComponent title={addon?.title} subTitle={addon?.description} error={addon.error} required={isRequired} status={isRequired ? `${addon?.quantityMinimum} ${t('Required')}` : t('optional')} />
                  <Options addon={addon} onSelectOption={onSelectOption} addonRefs={addonRefs} />
                </View>)
              })}
            </View>

            <View style={styles(currentTheme).line}></View>
            <View style={styles(currentTheme).inputContainer}>
              <TitleComponent title={t('specialInstructions')} subTitle={t('anySpecificPreferences')} status={t('optional')} />
              <TextInput style={styles(currentTheme).input} placeholder={t('noMayo')} value={specialInstructions} onChangeText={setSpecialInstructions} maxLength={144} placeholderTextColor={currentTheme.inputPlaceHolder} />
            </View>
            {/** frequently bought together */}
            <FrequentlyBoughtTogether itemId={food?._id} restaurantId={restaurant} />
          </View>
        </Animated.ScrollView>

        <Animated.View style={[styles(currentTheme).titleContainer, { opacity: 1, height: 35, marginTop: -12, zIndex: 9, padding: 2 }, animatedTitleStyle]}>
          <HeadingComponent title={food?.title} price={calculatePrice()} />
        </Animated.View>
        <View style={{ backgroundColor: currentTheme.themeBackground, zIndex: 10 }}>
          <CartComponent onPress={onPressAddToCart} disabled={!validateButton()} initialQuantity={editCartItem?.quantity} unitPrice={calculatePrice()} />
        </View>
        <View
          style={{
            paddingBottom: inset.bottom,
            backgroundColor: currentTheme.themeBackground
          }}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

export default ItemDetail
