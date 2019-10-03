import {
  OrthographicCamera
} from 'three'

import BaseClass from './BaseClass'

class QuadCameraClass extends BaseClass {
  init () {
    this.camera = new OrthographicCamera()
    this.camera.position.z = 1

    super.init()
  }
}

export default QuadCameraClass
