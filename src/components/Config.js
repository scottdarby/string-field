import {
  HalfFloatType,
  FloatType
} from 'three'

import Detector from '../libs/Detector'

class Config {
  constructor () {
    if (!Config.instance) {
      this.init()
      Config.instance = this
    }

    return Config.instance
  }

  init () {
    this.data = {
      renderer: {
        antialias: true
      },
      scene: {
        fullScreen: true,
        width: 800,
        height: 600,
        bgColor: 0x000000,
        canvasID: 'stage' // ID of webgl canvas element
      },
      post: {
        enabled: false,
        vignette: true,
        bloom: true
      },
      camera: {
        fov: 60,
        initPos: { x: 0, y: 0, z: 2 },
        near: 0.1,
        far: 5000,
        enableZoom: true // enable camera zoom on mousewheel/pinch gesture
      },
      dev: {
        debugPicker: false
      },
      floatType: Detector.isIOS ? HalfFloatType : FloatType
    }
  }

  get (id) {
    return this.data[id]
  }
}

const instance = new Config()
Object.freeze(instance)

export default Config
