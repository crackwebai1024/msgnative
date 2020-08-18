import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
// import EntypoIcon from 'react-native-vector-icons/Entypo'
import IonIcon from 'react-native-vector-icons/Ionicons'
// import RNFS from 'react-native-fs'
import { HeaderBackButton } from 'react-navigation'

import Text from 'app/Components/BaseText'
import FileActions from 'app/Redux/FileRedux'

import s from './style'
import FileRenderer from './components/FileRenderer'
import PdfRenderer from './components/PdfRenderer'
import ImageRenderer from './components/ImageRenderer'

class FileViewer extends Component {
  static navigationOptions = () => ({
    headerMode: 'float',
    title: 'yeeeahooo!'
  })

  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          encoding: PropTypes.string.isRequired,
          data: PropTypes.string.isRequired,
          fileName: PropTypes.string.isRequired
        }).isRequired
      }).isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)
    this._handleGoBack = this._handleGoBack.bind(this)
    this._handleShare = this._handleShare.bind(this)
    this._renderHeader = this._renderHeader.bind(this)
    this._renderFooter = this._renderFooter.bind(this)
  }

  _handleGoBack () {
    this.props.navigation.goBack()
  }

  _handleShare () {
    const {
      fileName,
      encoding,
      data
    } = this.props.navigation.state.params
    this.props.shareFile(fileName, data, encoding)
  }

  _renderHeader () {
    const { fileName } = this.props.navigation.state.params
    return (
      <View style={s.headerContainer}>
        <HeaderBackButton onPress={this._handleGoBack} />
        <Text style={s.headerTitle}>{fileName}</Text>
      </View>
    )
  }

  _renderFile () {
    const data = this.props.navigation.state.params
    const { mimeType } = data
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
        return <ImageRenderer data={data} />

      case 'application/pdf':
        return <PdfRenderer data={data} />

      default:
        return <FileRenderer data={data} onShare={this._handleShare} />
    }
  }

  _renderFooter () {
    return (
      <View style={s.footerContainer}>
        <TouchableOpacity style={s.footerShare} onPress={this._handleShare}>
          <IonIcon style={s.footerShareIcon} name='ios-share' />
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    return (
      <View style={s.container}>
        {this._renderFile()}
        {this._renderHeader()}
        {this._renderFooter()}
      </View>
    )
  }
}

const mapDispatchToProps = {
  shareFile: FileActions.shareFile
}

export default connect(null, mapDispatchToProps)(FileViewer)
