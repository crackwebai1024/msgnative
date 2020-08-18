import React, { PureComponent } from 'react'
import { View, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import { path } from 'ramda'
import EStyleSheet from 'react-native-extended-stylesheet'
import sanitizeHtml from 'sanitize-html'
import { injectIntl, intlShape } from 'react-intl'
import m from 'commons/I18n'
import AutoHeightWebView from 'app/Components/AutoHeightWebView'
import Text from 'app/Components/BaseText'
import palette from 'app/Styles/colors'
import LoadImages from './LoadImages'

class MailboxDetailBody extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    imagesVisible: PropTypes.bool,
    // embeddedVisible: PropTypes.bool,
    showImages: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      inProgress: false
    }

    this._remoteImagesPresent = false

    this._sanitizeHtml = this._sanitizeHtml.bind(this)
    this._renderContent = this._renderContent.bind(this)
    this._attachmentTransform = this._attachmentTransform.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    // https://github.com/facebook/react-native/issues/13574
    // Android webview would not rerender when user chooses to load
    // remote content. The solution is to unmount the WebView component
    // and mount again.
    if (this.props.imagesVisible === false &&
      nextProps.imagesVisible === true &&
      !this.state.inProgress
    ) {
      this.setState({ inProgress: true })
      setTimeout(() => this.setState({ inProgress: false }), 100)
    }
  }

  _sanitizeHtml () {
    const { html } = this.props.data.detail
    const options = {
      transformTags: {
        // Add `target="_blank"` attribute on all anchor tags
        'a': sanitizeHtml.simpleTransform('a', { 'target': '_blank' }),
        'img': this._attachmentTransform,
        'object': this._attachmentTransform
      },
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'style', 'img', 'html', 'head', 'body', 'center', 'title', 'span', 'ins', 'del', 'sup', 'sub'
      ]),
      allowedAttributes: false,
      allowedSchemes: ['data', 'mailto'],
      allowedSchemesByTag: {
        a: ['http', 'https', 'mailto', 'ftp'],
        img: ['data']
      }
    }

    if (this.props.imagesVisible) {
      options.allowedSchemesByTag.img = options.allowedSchemesByTag.img.concat(['http', 'https', 'ftp'])
    }

    return sanitizeHtml(html, options)
  }

  _attachmentTransform (tagName, attribs) {
    const { attachments, attachmentContentIds } = this.props.data.detail
    const { embeddedVisible } = this.props

    if (attribs.src && attribs.src.match(/^https?(.*)/)) {
      this._remoteImagesPresent = true
    }

    let imgSrc = null
    const contentIdKey = tagName === 'object' ? 'data' : 'src'

    const contentId = attribs[contentIdKey] && attribs[contentIdKey].replace(/cid:(.*)/, '$1')
    if (contentId && attachments[contentId]) {
      const attachment = attachments[contentId]
      // Hide inline attachment in mail content viewer after discussion with Rachel
      // But decided to keep the origin inline attachment render after discussion with Vivek
      if (attachment.isInlineImage) {
        return false
      }

      // Render inline image
      // if (attachment && attachment.isInlineImage && embeddedVisible) {
      if (attachment && attachment.isInlineImage) {
        imgSrc = `data:${attachment.contentType};base64,${attachment.data}`
        return {
          tagName: 'img',
          attribs: {
            ...attribs,
            src: imgSrc
          }
        }
      }

      // Render inline attachment link
      const contentIdIndex = attachmentContentIds.indexOf(contentId)
      if (attachment && contentIdIndex !== -1 && embeddedVisible) {
        const iconMarkup = getIconForMIMEType(attachment.contentType, true)
        return {
          tagName: 'a',
          text: `${iconMarkup} ${attachment.name}`,
          attribs: {
            href: '#',
            class: 'mailbox-detail__body__iframe__link',
            onclick: `javascript: parent.saveAttachment(${contentIdIndex}); return false;`
          }
        }
      }
    }

    return { tagName, attribs }
  }

  _renderContent () {
    const { data, intl } = this.props

    const error = path(['detailStatus', 'error'], data)
    const inProgress = path(['detailStatus', 'inProgress'], data)
    const html = path(['detail', 'html'], data)
    const plain = path(['detail', 'plain'], data)

    if (data && !data.is_msgsafe_store) {
      const message = data.useremail_email
        ? intl.formatMessage(m.native.Mailbox.forwardedStateWithEmail, { emailAddr: data.useremail_email })
        : intl.formatMessage(m.native.Mailbox.forwardedState)

      return (
        <Text style={[styles.emailBody, styles.emailInfoMessage]}>
          {message}
        </Text>
      )
    } else if (data && (data.is_pgp_out || data.is_smime_out)) {
      return <Text style={[styles.emailBody, styles.emailErrorMessage]}>{intl.formatMessage(m.app.Mailbox.outboundEncryptedState)}</Text>
    } else if (error) {
      return <Text style={[styles.emailBody, styles.emailErrorMessage]}>{error}</Text>
    } else if (inProgress || this.state.inProgress) {
      return (
        <View style={styles.activityIndicatorContainer}>
          {data.has_attachment && <Text style={styles.attachmentMsg}>{intl.formatMessage(m.native.Mailbox.downloadingAttachments)}...</Text>}
          <ActivityIndicator animating />
        </View>
      )
    }

    if (html) {
      return <AutoHeightWebView html={this._sanitizeHtml()} />
    }

    return <Text style={styles.emailBody}>{plain}</Text>
  }

  render () {
    const content = this._renderContent()
    const fm = this.props.intl.formatMessage

    return (
      <View>
        {
          this._remoteImagesPresent && !this.props.imagesVisible && LoadImages({
            textImageBlocked: fm(m.native.Mailbox.remoteImagesBlocked),
            textLoadRemoteImages: fm(m.native.Mailbox.loadRemoteImages),
            onPress: this.props.showImages
          })
        }
        {content}
      </View>
    )
  }
}

export default injectIntl(MailboxDetailBody)

const styles = EStyleSheet.create({

  activityIndicatorContainer: {
    flex: 1,
    flexGrow: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50%'
  },

  emailBody: {
    padding: '1rem',
    fontSize: '0.85rem',
    lineHeight: '1.5rem'
  },

  emailInfoMessage: {
    fontWeight: '600',
    color: palette.asbestos
  },

  emailErrorMessage: {
    fontWeight: '600',
    color: palette.pomegranate
  },

  attachmentMsg: {
    marginBottom: '1.5rem',
    color: palette.concrete
  }
})
