import { useState, useEffect, useMemo } from 'react'
import useRestaurant from './useRestaurant'

// "Current store" for the single-vendor-multi-location Home screen: the
// nearest open BTB location out of whatever `restaurantListPreview` already
// returned, unless the user has explicitly picked a different one via the
// store switcher. Returns that store's full menu (categories/foods/addons)
// via the same `useRestaurant` hook the Restaurant screen already uses.
export default function useCurrentStore(nearbyRestaurants, allRestaurants) {
  const [selectedId, setSelectedId] = useState(null)

  const nearestId = useMemo(() => {
    if (!nearbyRestaurants || nearbyRestaurants.length === 0) return null
    const sorted = [...nearbyRestaurants].sort(
      (a, b) => (a.distanceWithCurrentLocation ?? Infinity) - (b.distanceWithCurrentLocation ?? Infinity)
    )
    return sorted[0]._id
  }, [nearbyRestaurants])

  // Reset an explicit selection if it's no longer a real store at all (e.g.
  // location changed and the underlying data reloaded) — falls back to
  // nearest again. Validated against the *unbounded* list (falling back to
  // the nearby one if it isn't supplied) so switching to a store that's
  // outside delivery bounds - allowed, for pickup - doesn't immediately snap
  // back to the nearest in-bounds store.
  const membershipList = allRestaurants ?? nearbyRestaurants
  useEffect(() => {
    if (selectedId && !membershipList?.some((r) => r._id === selectedId)) {
      setSelectedId(null)
    }
  }, [membershipList, selectedId])

  const currentStoreId = selectedId || nearestId

  const { data, loading, error, refetch } = useRestaurant(currentStoreId)

  return {
    currentStoreId,
    currentStore: data?.restaurant,
    loadingCurrentStore: loading,
    errorCurrentStore: error,
    refetchCurrentStore: refetch,
    switchStore: setSelectedId
  }
}
