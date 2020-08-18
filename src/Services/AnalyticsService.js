const fakeAnalytics = {
  track: () => null,
  identify: () => null,
  alias: () => null,
  people: {
    set: () => null,
    setOnce: () => null
  }
}

const createService = () => fakeAnalytics

export default createService
