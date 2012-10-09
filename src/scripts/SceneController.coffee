class D.SceneController extends Backbone.View
  onMouseDown: (e) =>
    @mouseDown = true

    @mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    @mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    mouse = @mouse.clone()
    @projector.unprojectVector(mouse, @camera)

    ray = new THREE.Ray(@camera.position, mouse.subSelf(@camera.position).normalize())
    intersects = ray.intersectObjects(@objects)
    console.log intersects

  onMouseUp: (e) =>
    @mouseDown = false

  onMouseMove: (e) =>
    unless @mouseDown
      return

    @dragging = true

  constructor: ->
    super
    @mouse = new THREE.Vector3(0, 0, 0.5)
    @objects = []
    @projector = new THREE.Projector()

    @renderController = @options.renderController

    { domElement } = @renderController.renderer

    domElement.addEventListener('mousedown', @onMouseDown)
    domElement.addEventListener('mousemove', @onMouseMove)
    domElement.addEventListener('mouseup', @onMouseUp)

    width = window.innerWidth
    height = window.innerHeight

    viewAngle = 10 # fov
    aspectRatio = width / height

    @camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000)
    @camera.position.z = 365

    @controls = new THREE.TrackballControls(@camera)

    @scene = new THREE.Scene()
    @scene.fog = new THREE.FogExp2(0x222222, 0.002)

    ambientLight = new THREE.AmbientLight(0x222222)
    @scene.add(ambientLight)

    pointLight = new THREE.PointLight(0xffffff, 1, 500)
    pointLight.position.set(250, 250, 250)
    @scene.add(pointLight)

    D.loadGeometry('models/ducky.js').done (geometry) =>
      material = new THREE.MeshNormalMaterial({
        shading: THREE.SmoothShading
      })
      mesh = new THREE.Mesh(geometry, material)
      mesh.scale.set(scale=10, scale, scale)
      mesh.rotation.set(0, Math.PI / 2, 0)
      @objects.push(mesh)
      @scene.add(mesh)

    parameters =
      minFilter: THREE.LinearFilter
      magFilter: THREE.LinearFilter
      format: THREE.RGBAFormat
      stencilBuffer: true

    renderTarget = new THREE.WebGLRenderTarget(width, height, parameters)
    @composer = new THREE.EffectComposer(@renderController.renderer, renderTarget)

    foregroundPass = new THREE.RenderPass(@scene, @camera)

    screenPass = new THREE.ShaderPass(THREE.ShaderExtras.screen)
    screenPass.renderToScreen = true

    @composer.addPass(foregroundPass)
    @composer.addPass(screenPass)

  render: ->
    @controls.update()
    @composer.render()
