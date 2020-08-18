import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { connect } from 'react-redux'

import ContactActions from 'commons/Redux/ContactRedux'

class ContactSearchClean extends PureComponent {
  static propTypes = {
    contactClearSearchData: PropTypes.func.isRequired
  }

  componentWillUnmount () {
    const { contactClearSearchData } = this.props
    contactClearSearchData()
  }

  render () {
    return null
  }
}

const mapDispatchToProps = {
  contactClearSearchData: ContactActions.contactClearSearchData
}

export default connect(null, mapDispatchToProps)(ContactSearchClean)
