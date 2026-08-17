import React, { useState, useEffect, useContext } from 'react'
import { View, RefreshControl, Animated, Platform, TouchableOpacity } from 'react-native'
import { useQuery, gql } from '@apollo/client'
import { useNavigation, useRoute } from '@react-navigation/native'
import Search from '../../components/Main/Search/Search'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { theme } from '../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { restaurantListWithMenu } from '../../apollo/queries'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import OrdersContext from '../../context/Orders'
import { useCollapsibleSubHeader } from 'react-navigation-collapsible'
import Spinner from '../../components/Spinner/Spinner'
import { alignment } from '../../utils/alignment'
import { Ionicons } from '@expo/vector-icons'
import { storeSearch, getRecentSearches, clearRecentSearches } from '../../utils/recentSearch'
import SearchItemCard from '../../components/Main/SearchItemCard/SearchItemCard'
import { ScrollView } from 'react-native-gesture-handler'
import { sortRestaurantsByOpenStatus } from '../../utils/customFunctions'
import { escapeRegExp } from '../../utils/regex'

import useNetworkStatus from '../../utils/useNetworkStatus'
import ErrorView from '../../components/ErrorView/ErrorView'

const RESTAURANTS_WITH_MENU = gql`
  ${restaurantListWithMenu}
`

const SearchScreen = () => {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const { location, setLocation } = useContext(LocationContext)
  const navigation = useNavigation()
  const route = useRoute()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const newheaderColor = currentTheme.backgroundColor
  const [recentSearches, setRecentSearches] = useState([])
  const [hasAnimated, setHasAnimated] = useState(false) // Track first render

  // CustomItem component to handle animation
  const CustomItem = ({ index, children }) => {
    const scaleValue = new Animated.Value(0)

    React.useEffect(() => {
      if (!hasAnimated) {
        Animated.timing(scaleValue, {
          toValue: 1,
          delay: index * 40,
          duration: 300, // Set duration for the animation
          useNativeDriver: true
        }).start(() => {
          // Update hasAnimated to true after the first animation
          if (index === categoryTags.length - 1) {
            setHasAnimated(true)
          }
        })
      }
    }, [index, hasAnimated])

    return (
      <Animated.View
        style={{
          opacity: scaleValue
        }}
      >
        {children}
      </Animated.View>
    )
  }

  const { data, refetch, networkStatus, loading, error } = useQuery(RESTAURANTS_WITH_MENU, {
    variables: {
      longitude: location.longitude || null,
      latitude: location.latitude || null,
      shopType: null
    },
    fetchPolicy: 'network-only'
  })

  const { orders } = useContext(OrdersContext)

  useEffect(() => {
    navigation.setOptions({
      title: t('searchTitle'),
      headerTitleAlign: 'center',
      headerRight: null,
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: currentTheme.themeBackground,
        elevation: 0
      }
    })
  }, [navigation, currentTheme])

  useEffect(() => {
    getRecentSearches().then((searches) => setRecentSearches(searches))
  }, [search])

  useEffect(() => {
    if (route.params?.presetSearch) {
      setSearch(route.params.presetSearch)
      navigation.setParams({ presetSearch: undefined })
    }
  }, [route.params?.presetSearch])

  const { onScroll /* Event handler */, containerPaddingTop /* number */, scrollIndicatorInsetTop /* number */ } = useCollapsibleSubHeader()

  const restaurants = sortRestaurantsByOpenStatus(data?.nearByRestaurantsPreview?.restaurants || [])

  // Flatten every open restaurant's menu into one searchable item list —
  // this is a single-vendor app with a handful of physical locations, so
  // customers search for a burger, not a store name.
  const searchableItems = restaurants.flatMap((restaurant) =>
    (restaurant?.categories || []).flatMap((category) =>
      (category?.foods || [])
        .filter((food) => !food?.isOutOfStock)
        .map((food) => ({
          ...food,
          restaurant: restaurant._id,
          restaurantName: restaurant.name,
          restaurantAddons: restaurant.addons || [],
          restaurantOptions: restaurant.options || [],
          categoryTitle: category?.title,
          price: food?.variations?.[0]?.price,
          discounted: food?.variations?.[0]?.discounted
        }))
    )
  )

  const orderedFoodIds = new Set((orders || []).flatMap((order) => (order?.items || []).map((item) => item.food)))

  const searchAllItems = (searchText) => {
    const escapedSearchText = escapeRegExp(searchText)
    const regex = new RegExp(escapedSearchText, 'i')

    return searchableItems.filter((item) => {
      const titleMatch = item.title?.search(regex) > -1
      const descriptionMatch = item.description?.search(regex) > -1
      const categoryMatch = item.categoryTitle?.search(regex) > -1
      return titleMatch || descriptionMatch || categoryMatch
    })
  }

  const categoryTags = Array.from(
    new Set(restaurants.flatMap((restaurant) => (restaurant?.categories || []).map((category) => category.title)))
  )

  const { isConnected: connect, setIsConnected: setConnect } = useNetworkStatus()
  if (!connect) return <ErrorView />

  const emptyView = () => {
    return (
      <View style={styles(currentTheme).emptyViewContainer}>
        <View style={styles(currentTheme).emptyViewBox}>
          <TextDefault textColor={currentTheme.fontGrayNew} center>
            {t('noResults')}
          </TextDefault>
        </View>
      </View>
    )
    // }
  }

  const handleTagPress = (tag) => {
    setSearch(tag)
  }

  const handleClearRecentSearches = async () => {
    try {
      await clearRecentSearches()
      setRecentSearches([]) // Update state with empty array
    } catch (error) {
      console.log('Error clearing searches:', error)
    }
  }

  const renderTagsOrSearches = () => {
    if (search) {
      return (
        <View style={styles().searchList}>
          <Animated.FlatList
            contentInset={{
              top: containerPaddingTop
            }}
            contentContainerStyle={{
              paddingTop: Platform.OS === 'ios' ? 0 : containerPaddingTop,
              gap: 16,
              ...alignment.PBlarge
            }}
            contentOffset={{
              y: -containerPaddingTop
            }}
            onScroll={onScroll}
            scrollIndicatorInsets={{
              top: scrollIndicatorInsetTop
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={emptyView()}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl
                progressViewOffset={containerPaddingTop}
                colors={[currentTheme.iconColorPink]}
                refreshing={networkStatus === 4}
                onRefresh={() => {
                  if (networkStatus === 7) {
                    refetch()
                  }
                }}
              />
            }
            data={searchAllItems(search)}
            renderItem={({ item }) => <SearchItemCard item={item} orderedBefore={orderedFoodIds.has(item._id)} searchTerm={search} />}
          />
        </View>
      )
    } else if (recentSearches.length > 0) {
      return (
        <View style={styles(currentTheme).recentSearchContainer}>
          <View style={styles(currentTheme).flexRow}>
            <View>
              <TextDefault style={styles().drawerContainer} textColor={currentTheme.fontMainColor} small H4 bolder>
                {t('recentSearches')}
              </TextDefault>
            </View>
            <View>
              <TouchableOpacity onPress={() => handleClearRecentSearches()}>
                <TextDefault style={styles().drawerContainer} textColor={currentTheme.fontMainColor} normal bolder>
                  {t('clear')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles().line} />

          {/* recent seareches list */}

          {recentSearches.map((recentSearch, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity onPress={() => handleTagPress(recentSearch)} style={styles(currentTheme).recentListBtn}>
                <View>
                  <Ionicons name='search' color={currentTheme.gray500} size={scale(20)} />
                </View>
                <View>
                  <TextDefault>{recentSearch}</TextDefault>
                </View>
              </TouchableOpacity>

              <View style={styles().line} />
            </React.Fragment>
          ))}
        </View>
      )
    } else {
      return (
        <View style={styles(currentTheme).tagView}>
          {loading ? (
            <View style={{ ...alignment.MTmedium }}>
              <Spinner size={'small'} backColor={'transparent'} spinnerColor={currentTheme.main} />
            </View>
          ) : (
            categoryTags.map((tag, index) =>
              hasAnimated ? (
                <TouchableOpacity key={index} onPress={() => handleTagPress(tag)}>
                  <View style={styles(currentTheme).tagItem}>
                    <TextDefault>{tag}</TextDefault>
                  </View>
                </TouchableOpacity>
              ) : (
                <CustomItem index={index}>
                  <TouchableOpacity key={tag} onPress={() => handleTagPress(tag)}>
                    <View style={styles(currentTheme).tagItem}>
                      <TextDefault>{tag}</TextDefault>
                    </View>
                  </TouchableOpacity>
                </CustomItem>
              )
            )
          )}
        </View>
      )
    }
  }

  // search truthy renders its own Animated.FlatList (the search results) —
  // that must be the screen's only scroller, since nesting it inside this
  // ScrollView is exactly the "VirtualizedLists should never be nested
  // inside plain ScrollViews" anti-pattern (same fix as the Stores tab).
  // The other two branches (recent searches / tag cloud) are plain,
  // non-virtualized content, so the ScrollView is fine as their sole
  // scroller.
  return (
    <View style={styles(currentTheme).flex}>
      <View style={styles().searchbar}>
        <Search setSearch={setSearch} search={search} newheaderColor={newheaderColor} placeHolder={t('searchItems')} />
      </View>
      {search ? (
        renderTagsOrSearches()
      ) : (
        <ScrollView
          style={styles(currentTheme).flex}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              colors={[currentTheme.iconColorPink]}
              refreshing={networkStatus === 4}
              onRefresh={() => {
                if (networkStatus === 7) {
                  refetch()
                }
              }}
            />
          }
        >
          {renderTagsOrSearches()}
        </ScrollView>
      )}
    </View>
  )
}

export default SearchScreen
