import { defineMessages } from 'react-intl'

const ns = 'app.Terms'
const m = defineMessages({
  testimonial: {
    id: `${ns}.testimonial`,
    defaultMessage: 'Testimonials'
  },
  firstTitle: {
    id: `${ns}.first-title`,
    defaultMessage: 'Mark Zuckerberg'
  },
  firstPosition: {
    id: `${ns}.first-position`,
    defaultMessage: 'CEO at Facebook'
  },
  firstDescription: {
    id: `${ns}.first-description`,
    defaultMessage: 'Duis auctor hendrerit nisi ac commodo. Nulla turpis est, vehicula id neque sed, condimentum gravida sapien. Fusce dictum nunc ut orci venenatis maximus'
  }
})

export default m
