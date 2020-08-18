import React, { Component } from 'react'
import { View, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { change } from 'redux-form'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import { injectIntl } from 'react-intl'
import m from 'commons/I18n'
import { createSound, nullSound } from 'app/Lib/Audio'
import HeaderButton from 'app/Components/HeaderButton'

import ListItem from './components/ListItem'

const s = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})

class SoundSelection extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          form: PropTypes.string.isRequired,
          field: PropTypes.string.isRequired,
          sounds: PropTypes.arrayOf(PropTypes.shape({
            filename: PropTypes.string.isRequired,
            title: PropTypes.string
          })).isRequired
        }).isRequired
      }).isRequired
    })
  }

  constructor (props) {
    super(props)

    const state = {
      selected: nullSound,
      selecting: false
    }
    if (props.selected) {
      state.selected = { ...nullSound, ...props.selected }
    }
    this.state = state

    this._select = this._select.bind(this)
    this._release = this._release.bind(this)
    this._play = this._play.bind(this)
    this._startSelecting = this._startSelecting.bind(this)
    this._stopSelecting = this._stopSelecting.bind(this)
    this._onPressItem = this._onPressItem.bind(this)
    this._renderItem = this._renderItem.bind(this)
  }

  _keyExtractor (file) {
    return file.filename
  }

  _select (sound) {
    const { navigation } = this.props
    navigation.setParams({ selected: sound })
    return new Promise((resolve, reject) => {
      this.setState({ selected: sound }, resolve)
    })
  }

  _release () {
    return new Promise((resolve, reject) => {
      this.state.selected.release()
      this.setState({ selected: null }, resolve)
    })
  }

  _play () {
    this.state.selected.play()
  }

  _startSelecting () {
    return new Promise((resolve, reject) => {
      this.setState({ selecting: true }, resolve)
    })
  }

  _stopSelecting () {
    return new Promise((resolve, reject) => {
      this.setState({ selecting: false }, resolve)
    })
  }

  async _onPressItem (file) {
    if (this.state.selecting) {
      return
    }
    await this._startSelecting()
    try {
      // make sure to stop and release currently loaded and playing audio
      if (this.state.selected) {
        await this._release()
      }

      const sound = await createSound(file.filename)
      await this._select(sound)
      this._play()
    } catch (err) {
      console.error(err)
    }
    await this._stopSelecting()
  }

  _renderItem (props) {
    let selected = false
    if (
      this.state.selected &&
      this.state.selected.filename === props.item.filename
    ) {
      selected = true
    }
    return (
      <ListItem
        {...props}
        onPressItem={this._onPressItem}
        selected={selected}
      />
    )
  }

  render () {
    return (
      <View style={s.container}>
        <FlatList
          data={[nullSound, ...this.props.navigation.state.params.sounds]}
          extraData={this.state}
          renderItem={this._renderItem}
          keyExtractor={this._keyExtractor}
        />
      </View>
    )
  }
}
const IntlSoundSelection = injectIntl(SoundSelection)

IntlSoundSelection.navigationOptions = ({ navigation, screenProps: { fm } }) => ({
  title: fm(m.native.Dashboard.selectSound),
  headerLeft: (
    <HeaderButton
      title={fm(m.app.Common.cancel)}
      onPress={() => {
        const { selected } = navigation.state.params
        if (selected) {
          selected.release()
        }
        navigation.goBack()
      }}
    />
  ),
  headerRight: (
    <HeaderButton
      title={fm(m.app.Common.done)}
      onPress={() => {
        const { form, field, selected } = navigation.state.params
        if (selected) {
          navigation.dispatch(change(form, field, selected.filename))
          selected.release()
        }
        navigation.goBack()
      }}
    />
  ),
  tabBarVisible: false
})

const mapStateToProps = (state, ownProps) => {
  const props = {}
  const { form, field, sounds } = ownProps.navigation.state.params
  const selected = path(['form', form, 'values', field], state)
  if (selected) {
    props.selected = sounds.find(item => item.filename === selected)
  }
  return props
}

export default connect(mapStateToProps)(IntlSoundSelection)
