import {
  Vector2
} from 'three'

import { lerp } from '../../helpers/math'

import BaseClass from './BaseClass'

class MouseClass extends BaseClass {
  init () {
    this.mousePos = new Vector2()
    this.smoothedMousePos = new Vector2()
    super.init()
  }

  onMouseMove (e) {
    this.mousePos.x = e.clientX
    this.mousePos.y = e.clientY

    super.onMouseMove()
  }

  renderFrame ({ dt } = {}) {
    this.smoothedMousePos.x = lerp(this.smoothedMousePos.x, this.mousePos.x, dt * 0.1)
    this.smoothedMousePos.y = lerp(this.smoothedMousePos.y, this.mousePos.y, dt * 0.1)

    super.renderFrame()
  }
}

export default MouseClass
