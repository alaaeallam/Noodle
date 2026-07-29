import axios from 'axios'
import useEnvVars from '../../../environment'

const useGeocoding = () => {
  const { GOOGLE_MAPS_KEY } = useEnvVars()

  const getAddress = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}&language=en`
      )

      const { status, error_message, results } = response.data ?? {}

      if (status !== 'OK') {
        if (status === 'ZERO_RESULTS') {
          throw new Error('No address found for the given coordinates.')
        }
        // REQUEST_DENIED, OVER_QUERY_LIMIT, OVER_DAILY_LIMIT, INVALID_REQUEST, UNKNOWN_ERROR
        throw new Error(
          `Geocoding API error (${status}): ${error_message ?? 'Unknown error'}`
        )
      }

      // Extract the formatted address from the first result
      const formattedAddress = results[0].formatted_address
      // Extract the city from the address components
      const cityComponent = results[0].address_components.find(
        (component) =>
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_2')
      )
      const city = cityComponent ? cityComponent.long_name : null

      return { formattedAddress, city }
    } catch (error) {
      console.error('Error fetching address:', error.message)
      throw error
    }
  }
  return {getAddress}
}

export default useGeocoding
