import mime from 'react-native-mime-types'

// add mime extensions
mime.extensions['application/x-iwork-keynote-sffkey'] = ['key']
mime.extensions['application/x-iwork-pages-sffpages'] = ['pages']
mime.extensions['application/x-iwork-keynote-sffnumbers'] = ['numbers']

// add mime types
mime.types.key = 'application/x-iwork-keynote-sffkey'
mime.types.pages = 'application/x-iwork-pages-sffpages'
mime.types.numbers = 'application/x-iwork-keynote-sffnumbers'
