/*------------------------------------------
3rd Party
------------------------------------------*/
import React, { Component } from 'react'
import {
  Vector2,
  Color,
  Clock
} from 'three'
import EventEmitter from 'eventemitter3'
import mixin from 'mixin'
import TWEEN from 'tween.js'

/*------------------------------------------
Post
------------------------------------------*/
import {
  EffectComposer,
  ShaderPass,
  RenderPass
  // UnrealBloomPass
} from '../libs/post/EffectComposer'
import Vignette from '../libs/post/Vignette'

/*------------------------------------------
Config
------------------------------------------*/
import Config from './Config'

/*------------------------------------------
Classes
------------------------------------------*/
import RendererClass from './classes/RendererClass'
import SceneClass from './classes/SceneClass'
import CameraClass from './classes/CameraClass'
import ControlsClass from './classes/ControlsClass'
import QuadCameraClass from './classes/QuadCameraClass'
import FBOClass from './classes/FBOClass'
import MouseClass from './classes/MouseClass'

/*------------------------------------------
Styles
------------------------------------------*/
import './Main.css'

class Main extends mixin(EventEmitter, Component) {
  constructor (props) {
    super(props)

    this.config = new Config().data
    this.clock = new Clock()
  }

  componentDidMount () {
    this.initStage()
  }

  initStage () {
    SceneClass.getInstance().init()
    CameraClass.getInstance().init()
    RendererClass.getInstance().init()
    ControlsClass.getInstance().init()
    QuadCameraClass.getInstance().init()
    MouseClass.getInstance().init()
    FBOClass.getInstance().init({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    this.initPost()
    this.addEvents()
    this.animate()
  }


  initPost () {
    if (!this.config.post.enabled) {
      return
    }
    this.composer = new EffectComposer(RendererClass.getInstance().renderer)
    this.renderPass = new RenderPass(SceneClass.getInstance().scene, CameraClass.getInstance().camera)
    this.composer.addPass(this.renderPass)

    this.setPostSettings()
  }

  setPostSettings () {
    if (!this.composer) {
      return
    }

    // if (this.config.post.bloom) {
    //   // res, strength, radius, threshold
    //   this.bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 0.9, 0.7, 0.1)
    //   this.composer.addPass(this.bloomPass)
    // }

    if (this.config.post.vignette) {
      if (this.vignettePass) {
        this.vignettePass.enabled = true
        this.renderPass.renderToScreen = false
      } else {
        this.vignettePass = new ShaderPass(Vignette)
        this.vignettePass.material.uniforms.bgColor.value = new Color(this.config.scene.bgColor)
        this.vignettePass.renderToScreen = true
        this.composer.addPass(this.vignettePass)
      }
    } else {
      if (this.vignettePass) {
        this.vignettePass.enabled = false
      }
      this.renderPass.renderToScreen = true
    }
  }

  animate () {
    window.requestAnimationFrame(this.animate.bind(this))
    this.renderFrame()
  }

  renderFrame () {

    TWEEN.update()

    MouseClass.getInstance().renderFrame({
      clock: this.clock
    })

    ControlsClass.getInstance().renderFrame()
    
    FBOClass.getInstance().renderFrame({
      clock: this.clock
    })

    if (this.config.post.enabled) {
      this.composer.render()
    } else {
      RendererClass.getInstance().renderFrame({
        camera: QuadCameraClass.getInstance().camera
      })
    }
  }

  addEvents () {
    window.addEventListener('resize', this.resize.bind(this), false)
    this.resize()
    RendererClass.getInstance().renderer.domElement.addEventListener('mousemove', (e) => {
      MouseClass.getInstance().onMouseMove(e)
    }, false)
  }

  

  resize () {
    this.width = window.innerWidth
    this.height = window.innerHeight

    CameraClass.getInstance().resize(this.width, this.height)
    RendererClass.getInstance().resize(this.width, this.height)
    FBOClass.getInstance().resize(this.width, this.height)

    if (this.config.post.enabled) {
      this.composer.setSize(this.width, this.height)
    }
  }

  destroy () {
    RendererClass.getInstance().dispose()
    SceneClass.getInstance().destroy()
    ControlsClass.getInstance().destroy()
    FBOClass.getInstance().destroy()

    if (this.composer) {
      delete this.composer
    }

    window.cancelAnimationFrame(this.animate)
    this.running = false
  }

  render () {
    return (
      <canvas width={this.width} height={this.height} id={this.config.scene.canvasID} />
    )
  }
}

export default Main
