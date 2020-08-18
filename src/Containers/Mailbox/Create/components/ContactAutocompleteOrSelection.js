import React, { Component } from 'react'
import { connect } from 'react-redux'
import BaseText from 'app/Components/BaseText'
import { TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Autocomplete from 'react-native-autocomplete-input'
import { pathOr } from 'ramda'
import debounce from 'lodash.debounce'

import TextInputOrForeignItemSelectionInput from 'app/Components/Form/TextInputOrForeignItemSelectionInput'
import ContactActions from 'commons/Redux/ContactRedux'

const styles = EStyleSheet.create({
  container: {
    margin: 0,
    position: 'relative',
    zIndex: 1
  },
  inputContainer: {
    borderWidth: 0,
    left: 0
  },
  listContainer: {
    zIndex: 100,
    borderWidth: 0,
    marginLeft: -10,
    marginRight: -10
  },
  list: {
    position: 'relative',
    margin: 0,
    marginTop: 4,
    paddingTop: '.5rem',
    paddingLeft: '.5rem',
    borderWidth: 0,
    borderTopWidth: 2,
    borderTopColor: 'rgb(211,211,215)',
    borderColor: 'rgb(211,211,215)',
    backgroundColor: 'rgb(245,245,251)'
  },
  itemText: {
    fontSize: 15,
    margin: '.5rem',
    marginTop: '.4rem',
    marginBottom: '.4rem',
    zIndex: 101
  }
})

class ContactAutocompleteOrSelection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      query: ''
    }

    this.setContactSearchQuery = debounce(this.props.setContactSearchQuery, 100)
    this._onChangeText = this._onChangeText.bind(this)
  }

  componentWillUnmount () {
    this.props.contactClearSearchData()
  }

  _onChangeText (text) {
    this.props.input.onChange(text)
    this.setState({ query: text.email || text })

    this.setContactSearchQuery(text)
  }

  _onSelect (text) {
    this.props.input.onChange(text)
    this.setState({ query: text.email || text })

    this.props.contactClearSearchData()
  }

  render () {
    const { query } = this.state
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim()
    const { searchResultsData, textInputProps, ...props } = this.props
    const newTextInputProps = {
      containerStyle: styles.container,
      inputContainerStyle: styles.inputContainer,
      listContainerStyle: styles.listContainer,
      listStyle: styles.list,
      onChangeText: this._onChangeText,
      data: query && searchResultsData.length && comp(query, searchResultsData[0].email) ? [] : searchResultsData,
      renderItem: (contact) => (
        <TouchableOpacity onPress={() => this._onSelect(contact)}>
          <BaseText style={styles.itemText}>
            {`${contact.display_name} <${contact.email}>`}
          </BaseText>
        </TouchableOpacity>
      ),
      ...textInputProps
    }

    return (
      <TextInputOrForeignItemSelectionInput
        textComponent={Autocomplete}
        textInputProps={newTextInputProps}
        {...props}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const searchResultsData = pathOr({}, ['contact', 'searchResultsData'], state)
  const searchResultsDataOrder = pathOr([], ['contact', 'searchResultsDataOrder'], state)

  return {
    searchResultsData: searchResultsDataOrder.map(id => searchResultsData[id])
  }
}

const mapDispatchToProps = {
  setContactSearchQuery: ContactActions.contactSetSearchQuery,
  contactClearSearchData: ContactActions.contactClearSearchData
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactAutocompleteOrSelection)
