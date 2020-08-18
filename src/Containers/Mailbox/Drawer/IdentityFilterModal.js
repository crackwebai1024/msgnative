import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import Modal from 'app/Components/Modal'
import IdentityList from 'app/Containers/Identity'
import MailboxActions from 'commons/Redux/MailboxRedux'
import { isLoggedIn } from 'commons/Selectors/User'

class IdentityFilterModal extends Component {
  static propTypes = {
    filterIdentityIds: PropTypes.array,
    isLoggedIn: PropTypes.bool,
    intl: PropTypes.object,
    visible: PropTypes.bool,
    clearMailboxIdentityFilter: PropTypes.func,
    toggleMailboxIdentityFilter: PropTypes.func
  }

  render () {
    if (!this.props.isLoggedIn) return null
    const fm = this.props.intl.formatMessage
    return (
      <Modal
        visible={this.props.visible}
        navBarTitle={fm(m.native.Mailbox.selectMailboxes)}
        leftTitle={fm(m.native.Mailbox.clearAll)}
        onLeft={this.props.clearMailboxIdentityFilter}
        rightTitle={fm(m.app.Common.done)}
      >
        <IdentityList
          ref='list'
          hideTabBar
          enableItemSelection
          toggleItemSelection={this.props.toggleMailboxIdentityFilter}
          initiallySelectedItemIDs={this.props.filterIdentityIds}
        />
      </Modal>
    )
  }
}
const IntlIdentityFilterModal = injectIntl(IdentityFilterModal)
const mapStateToProps = state => ({
  filterIdentityIds: state.mailbox.filterIdentityIds,
  isLoggedIn: isLoggedIn(state.user)
})

const mapDispatchToProps = {
  toggleMailboxIdentityFilter: MailboxActions.toggleMailboxIdentityFilter,
  clearMailboxIdentityFilter: MailboxActions.clearMailboxIdentityFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(IntlIdentityFilterModal)
