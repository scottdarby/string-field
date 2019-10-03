import {
  WebGLRenderTarget,
  ClampToEdgeWrapping,
  NearestFilter,
  RGBAFormat,
  PlaneBufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector2
} from 'three'

import BaseClass from './BaseClass'
import SceneClass from './SceneClass'
import MouseClass from './MouseClass'
import TouchClass from './TouchClass'

import PassThroughVert from '../shaders/passThrough.vert'
// import PassThroughFrag from '../shaders/passThrough.frag'
import StringFieldFrag from '../shaders/StringField.frag'

class FBOClass extends BaseClass {
  init ({
    width,
    height
  } = {}) {
    this.width = width
    this.height = height

    this.initRenderTargets()
    this.initMaterial()
    this.addMesh()

    super.init()
  }

  initRenderTargets () {
    this.rt1 = new WebGLRenderTarget(
      this.width,
      this.height,
      {
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: this.config.floatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
      }
    )

    this.rt2 = this.rt1.clone()
  }

  initMaterial () {
    this.material = new ShaderMaterial({
      uniforms: {
        positionTexture: {
          type: 't',
          value: null
        },
        uResolution: {
          type: 'v2',
          value: new Vector2(this.width, this.height)
        },
        uTime: {
          type: 'f',
          value: 0.0
        },
        uMousePos: {
          type: 'v2',
          value: new Vector2()
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: StringFieldFrag
    })
  }

  addMesh () {
    const geo = new PlaneBufferGeometry(2, 2)
    const mesh = new Mesh(geo, this.material)
    SceneClass.getInstance().scene.add(mesh)
  }

  resize (width, height) {
    this.rt1.setSize(width, height)
    this.rt2.setSize(width, height)

    this.material.uniforms.uResolution.value = new Vector2(width, height)
    super.resize()
  }

  renderFrame ({ clock } = {}) {
    this.material.uniforms.uTime.value = clock.getElapsedTime()

    if (this.config.detector.isMobile) {
      this.material.uniforms.uMousePos.value = TouchClass.getInstance().smoothedTouchPos
    } else {
      this.material.uniforms.uMousePos.value = MouseClass.getInstance().smoothedMousePos
    }

    super.renderFrame()
  }
}

export default FBOClass
