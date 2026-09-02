const { GraphQLError } = require('graphql')
const Country = require('../../models/country')

const resolvers = {
  Query: {
    // Get all countries
    getCountries: async () => {
      try {
        const countries = await Country.find()
        return countries
      } catch (error) {
        throw new GraphQLError('Error fetching countries', {
          extensions: { code: 'DATABASE_ERROR' }
        })
      }
    },

    // Get a single country by iso
    getCountryByIso: async (_, { iso }) => {
      try {
        const country = await Country.findOne({ iso2: iso.toUpperCase() })
        return country
      } catch (error) {
        throw new GraphQLError('Error fetching country by name', {
          extensions: { code: 'DATABASE_ERROR' }
        })
      }
    }
  }
}

module.exports = resolvers
