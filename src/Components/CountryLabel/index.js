import PropTypes from 'prop-types'
import React from 'react'
import Text from 'app/Components/BaseText'
import country from 'country-list'
import emojiFlags from 'emoji-flags'

/**
 * Used with react-select dropdown to create the country label.
 *
 * @param code
 * @constructor
 */
const CountryLabel = ({ code }) => (
  <Text>{country().getName(code)} {emojiFlags.countryCode(code)}</Text>
)

CountryLabel.propTypes = {
  code: PropTypes.string.isRequired
}

export default CountryLabel
