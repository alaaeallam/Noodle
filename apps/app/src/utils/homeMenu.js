const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Flattens a restaurant's categories[].foods into one list, each item
// carrying its category title along for display/filtering. Excludes
// out-of-stock items, same convention Search already uses for menu browsing.
export function flattenMenu(restaurant) {
  if (!restaurant?.categories) return []
  const items = []
  for (const category of restaurant.categories) {
    for (const food of category.foods || []) {
      if (food.isOutOfStock) continue
      items.push({ ...food, categoryTitle: category.title })
    }
  }
  return items
}

// The Home hero's "Today's drop" pick(s): every admin-marked featured item,
// falling back to just the first available item so the hero always has
// something real to show rather than being fabricated or left empty.
export function getFeaturedItems(restaurant) {
  const items = flattenMenu(restaurant)
  if (items.length === 0) return []
  const featured = items.filter((item) => item.isFeatured)
  return featured.length > 0 ? featured : [items[0]]
}

// Today's closing time as "H:MM"/"HH:MM" from openingTimes' [hour, minute]
// tuples (same shape `isOpen()` in customFunctions.js already parses).
// Returns null if the store has no hours configured for today.
export function getTodayClosingTime(restaurant) {
  const openingTimes = restaurant?.openingTimes
  if (!openingTimes || openingTimes.length === 0) return null
  const todayKey = DAY_KEYS[new Date().getDay()]
  const today = openingTimes.find((o) => o.day === todayKey)
  if (!today?.times?.length) return null
  // Last slot of the day is the one that determines closing time.
  const lastSlot = today.times[today.times.length - 1]
  const endHour = Number(lastSlot?.endTime?.[0])
  const endMinute = Number(lastSlot?.endTime?.[1])
  if (Number.isNaN(endHour) || Number.isNaN(endMinute)) return null
  return `${endHour}:${String(endMinute).padStart(2, '0')}`
}
