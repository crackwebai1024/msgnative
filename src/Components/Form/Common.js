import React from 'react'

import Text from 'app/Components/BaseText'

import { formSectionStyles } from './styles'

export const FormSectionTitle = ({ text }) => (
  <Text style={formSectionStyles.title}>{text.toUpperCase()}</Text>
)
