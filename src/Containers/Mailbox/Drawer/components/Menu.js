import React, { PureComponent } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'

import MailboxActions from 'commons/Redux/MailboxRedux'
import SideMenuButton from './FilterButton'
import commonStyles from 'app/Styles/common'
import palette from 'app/Styles/colors'
import Text from 'app/Components/BaseText'
import m from 'commons/I18n'

const styles = EStyleSheet.create({
  main: {
    backgroundColor: palette.darkStateBlue,
    paddingTop: '1.7rem',
    paddingBottom: '2rem',
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
    marginLeft: 0
  },

  paddedContent: {
    paddingLeft: '1.2rem',
    paddingRight: '1.2rem'
  },

  section: {
    marginTop: '2rem'
  },

  sectionTitle: {
    marginLeft: '0.6rem',
    marginRight: '0.6rem',
    marginBottom: '0.5rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    marginTop: '0.5rem',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  sectionTitleText: {
    color: palette.clouds,
    fontWeight: '500',
    fontSize: '0.82rem',
    letterSpacing: '0.04rem'
  },

  sectionTitleIcon: {
    color: palette.clouds,
    fontSize: '0.8rem',
    marginRight: '0.3rem'
  },

  buttonSmall: {
  },

  buttonText: {
    color: palette.touchofgray,
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.05rem',
    opacity: 0.7
  },

  descriptionText: {
    color: palette.touchofgray,
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.05rem',
    opacity: 0.6,
    paddingLeft: '0.7rem'
  }
})

class MailboxSideMenu extends PureComponent {
  _setMailboxFilter (filter) {
    const { clearMailboxFilter, setMailboxFilter, closeDrawer } = this.props

    return () => {
      filter ? setMailboxFilter(filter) : clearMailboxFilter()

      closeDrawer()
    }
  }

  _getFiltersData () {
    const fm = this.props.intl.formatMessage
    return [
      {
        text: fm(m.native.Mailbox.inbox), key: null, featherIconName: 'inbox', onPress: this._setMailboxFilter()
      },
      {
        text: fm(m.native.Mailbox.unread), key: 'unread', featherIconName: 'bell', onPress: this._setMailboxFilter('unread')
      },
      {
        text: fm(m.native.Mailbox.sent), key: 'sent', featherIconName: 'mail', onPress: this._setMailboxFilter('sent')
      },
      {
        text: fm(m.native.Mailbox.forwarded), key: 'forwarded', featherIconName: 'corner-up-right', onPress: this._setMailboxFilter('forwarded')
      },
      {
        text: fm(m.native.Mailbox.archive), key: 'archive', featherIconName: 'folder', onPress: this._setMailboxFilter('archive')
      },
      {
        text: fm(m.native.Mailbox.trash), key: 'trash', featherIconName: 'trash-2', onPress: this._setMailboxFilter('trash')
      }
    ]
  }

  _renderFilters () {
    const { filterName } = this.props
    const filterData = this._getFiltersData()
    const filters = filterData.map(item => (
      <SideMenuButton active={item.key === filterName} {...item} />
    ))

    return (
      <View style={styles.paddedContent}>
        {filters}
      </View>
    )
  }

  _renderFilterByIdentity () {
    const { filterName, intl: { formatMessage: fm }, filterIdentityIdsCount } = this.props
    const baseText = fm(m.native.Mailbox.mailboxes)
    const item = {
      text: filterIdentityIdsCount > 0 ? `${baseText}  (${filterIdentityIdsCount})` : baseText,
      key: 'identity',
      featherIconName: 'user',
      onPress: this._moveToIdentitySelection.bind(this)
    }

    return (
      <View style={styles.paddedContent}>
        <SideMenuButton active={item.key === filterName} {...item} />
      </View>
    )
  }

  _handleIndentitiesSelection (ids = []) {
    this.props.toggleMailboxIdentityFilter(ids)
  }

  _moveToIdentitySelection () {
    const { closeDrawer } = this.props
    this.props.navigation.navigate('IdentitySelection', {
      disableSwipe: true,
      onSubmit: this._handleIndentitiesSelection.bind(this),
      onCancel: () => {},
      mailboxFilter: true,
      headerLeftProps: { isBack: true }
    })
    closeDrawer()
  }

  _resetFilter () {
    const { clearAllMailboxRelationFilters, closeDrawer } = this.props
    clearAllMailboxRelationFilters()
    closeDrawer()
  }

  _isFilterApplied () {
    const { filterIdentityIdsCount } = this.props
    return filterIdentityIdsCount > 0
  }

  render () {
    const fm = this.props.intl.formatMessage
    const isFilterApplied = this._isFilterApplied()
    return (
      <ScrollView style={[styles.main, this.props.style]}>
        { this._renderFilters() }
        <View style={styles.section}>
          <View style={[styles.sectionTitle, commonStyles.horizontalAlign]}>
            <Text style={styles.sectionTitleText}>{fm(m.app.Common.filters).toUpperCase()}</Text>
            {isFilterApplied &&
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.buttonSmall]}
                onPress={this._resetFilter.bind(this)}
              >
                <Text style={styles.buttonText}>{fm(m.app.Common.reset).toUpperCase()}</Text>
              </TouchableOpacity>
            }
          </View>
          { this._renderFilterByIdentity() }
        </View>
      </ScrollView>
    )
  }
}

const IntlMailboxSideMenu = injectIntl(MailboxSideMenu)

const mapDispatchToProps = {
  setMailboxFilter: MailboxActions.setMailboxFilter,
  clearMailboxFilter: MailboxActions.clearMailboxFilter,
  toggleMailboxIdentityFilter: MailboxActions.toggleMailboxIdentityFilter,
  clearAllMailboxRelationFilters: MailboxActions.clearAllMailboxRelationFilters,
  clearMailboxIdentityFilter: MailboxActions.clearMailboxIdentityFilter,
  fetchMailbox: MailboxActions.mailboxFetch
}

const mapStateToProps = state => ({
  filterName: state.mailbox.filterName,
  filterIdentityIdsCount: (state.mailbox.filterIdentityIds || []).length
})

export default connect(mapStateToProps, mapDispatchToProps)(IntlMailboxSideMenu)
