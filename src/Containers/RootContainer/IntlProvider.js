import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import Text from 'app/Components/BaseText'

function defaultSelector (state) {
  const { intl } = state
  return {
    key: intl.locale,
    ...intl,
    defaultLocale: intl.locale,
    textComponent: Text
  }
}

const mapStateToProps = (state, { intlSelector = defaultSelector }) =>
  intlSelector(state)

export default connect(mapStateToProps)(IntlProvider)
