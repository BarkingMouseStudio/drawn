class D.SceneController extends Backbone.View
  constructor: ->
    super

    @renderController = @options.renderController

    { domElement } = @renderController.renderer

    viewAngle = 10 # fov
    aspectRatio = window.innerWidth / window.innerHeight

    @camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000)
    @camera.position.z = 365

    @interactionController = new D.InteractionController
      camera: @camera
      el: domElement

    # @controls = new THREE.TrackballControls(@camera)

    @scene = new THREE.Scene()
    @scene.fog = new THREE.FogExp2(0x222222, 0.002)

    ambientLight = new THREE.AmbientLight(0x222222)
    @scene.add(ambientLight)

    pointLight = new THREE.PointLight(0xffffff, 1, 500)
    pointLight.position.set(250, 250, 250)
    @scene.add(pointLight)

    $.when([
      D.loadGeometry('models/ducky_0.js')
      D.loadGeometry('models/ducky_1.js')
      D.loadGeometry('models/ducky_2.js')
      D.loadGeometry('models/ducky_3.js')
      D.loadGeometry('models/ducky_4.js')
      D.loadGeometry('models/ducky_5.js')
    ]).done (geometries...) =>
      group = new THREE.Object3D()

      _.each geometries, (geometry) =>
        material = new THREE.MeshNormalMaterial({
          shading: THREE.SmoothShading,
          opacity: 0.8
        })
        mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(scale=10, scale, scale)
        mesh.rotation.set(0, Math.PI / 2, 0)
        group.add(mesh)

      @interactionController.setObject(group)
      @scene.add(group)

    parameters =
      minFilter: THREE.LinearFilter
      magFilter: THREE.LinearFilter
      format: THREE.RGBAFormat
      stencilBuffer: true

    renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters)
    @composer = new THREE.EffectComposer(@renderController.renderer, renderTarget)

    foregroundPass = new THREE.RenderPass(@scene, @camera)

    screenPass = new THREE.ShaderPass(THREE.ShaderExtras.screen)
    screenPass.renderToScreen = true

    @composer.addPass(foregroundPass)
    @composer.addPass(screenPass)

  render: ->
    # @controls.update()
    @interactionController.update()
    @composer.render()
