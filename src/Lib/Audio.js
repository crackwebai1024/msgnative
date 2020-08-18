import Sound from 'react-native-sound'

export const notifications = [
  {
    filename: 'bamboo.mp3',
    title: 'Bamboo'
  },
  {
    filename: 'bonus.mp3',
    title: 'Bonus'
  },
  {
    filename: 'ding.mp3',
    title: 'Ding'
  },
  {
    filename: 'friendly.mp3',
    title: 'Friendly'
  },
  {
    filename: 'honk.mp3',
    title: 'Honk'
  },
  {
    filename: 'kalimba.mp3',
    title: 'Kalimba'
  },
  {
    filename: 'pebbles.mp3',
    title: 'Pebbles'
  },
  {
    filename: 'probe.mp3',
    title: 'Probe'
  },
  {
    filename: 'tiptoe.mp3',
    title: 'Tiptoe'
  },
  {
    filename: 'wind_chime.mp3',
    title: 'Wind chime'
  }
]

export const ringtones = [
  {
    filename: 'tone_abstract.mp3',
    title: 'Abstract'
  },
  {
    filename: 'alarm.mp3',
    title: 'Alarm'
  },
  {
    filename: 'big_ben.mp3',
    title: 'Big Ben'
  },
  {
    filename: 'bright_lights.mp3',
    title: 'Bright Lights'
  },
  {
    filename: 'classic.mp3',
    title: 'Classic'
  },
  {
    filename: 'level_up.mp3',
    title: 'Level Up'
  },
  {
    filename: 'magic.mp3',
    title: 'Magic'
  },
  {
    filename: 'marimba.mp3',
    title: 'Marimba'
  },
  {
    filename: 'wake.mp3',
    title: 'Wake'
  }
]

export const nullSound = {
  filename: null,
  title: 'None',
  play: () => {},
  release: () => {}
}

export const getSystemVolume = (category = 'Playback') => new Promise((resolve) => {
  Sound.prototype.getSystemVolume((error, volume) => {
    console.info('System Volume:', volume)
    if (error) {
      console.log(error)
      resolve(1.0)
    } else {
      resolve(volume)
    }
  })
})

export const createSound = (filename, category = 'Playback', numberOfLoops = 0, volume = -1) =>
  new Promise((resolve, reject) => {
    if (!filename) {
      return resolve(nullSound)
    }
    if (category !== 'default') {
      Sound.setCategory(category, false)
    }
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        return reject(err)
      }
      sound.setNumberOfLoops(numberOfLoops)
      sound.setVolume(volume)
      sound.filename = filename
      resolve(sound)
    })
  })
