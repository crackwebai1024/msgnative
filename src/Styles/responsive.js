// iOS device logical resolutions based breakpoints
const breakpoints = {
  // iPhone 4s, 5s, SE - default at 320px

  // iPhone 6, 7
  min375: '@media (min-width: 375px)',

  // iPhone 7 Plus
  min414: '@media (min-width: 414px)',

  // iPad Mini, Air
  min768: '@media (min-width: 768px)',

  // iPad Pro
  min1024: '@media (min-width: 1024px)'
}

const scales = {
  [breakpoints.min375]: {
    $scale: 1.2
  },

  [breakpoints.min414]: {
    $scale: 1.4
  },

  [breakpoints.min768]: {
    $scale: 2.0
  }
}

module.exports = {
  breakpoints,
  scales
}
