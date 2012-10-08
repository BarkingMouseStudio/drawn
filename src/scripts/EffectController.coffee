class D.EffectController extends Backbone.View
  constructor: ->
    super
    @renderController = @options.renderController

    width = window.innerWidth
    height = window.innerHeight

    bluriness1 = maxBluriness1 = 16
    bluriness2 = maxBluriness2 = 4
    hBlurPass1 = null
    vBlurPass1 = null
    hBlurPass2 = null
    vBlurPass2 = null

    rotationControls = null

    initBackground = (width, height) ->
      halfWidth = width / 2
      halfHeight = height / 2
      camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10000, 10000)
      camera.position.z = 100

      material = new THREE.MeshBasicMaterial
        map: THREE.ImageUtils.loadTexture('images/sleeping_woman.png')
        depthTest: false

      size = 665
      aspectRatio = 1230 / 1510

      mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
      mesh.position.y = 65
      mesh.scale.set(size * aspectRatio, size, 1)

      scene = new THREE.Scene()
      scene.add(mesh)
      return [scene, camera]

    initForeground = (width, height) =>
      viewAngle = 10 # fov
      aspectRatio = width / height

      camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000)
      camera.position.z = 365

      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0xffffff, 0.002)

      ambientLight = new THREE.AmbientLight(0x222222)
      scene.add(ambientLight)

      pointLight = new THREE.PointLight(0xffffff, 1, 500)
      pointLight.position.set(250, 250, 250)
      scene.add(pointLight)

      particlesController = new D.ParticlesController(scene: scene, renderController: @renderController)

      D.loadGeometry('models/sleeping_woman_extruded.js')
        .done (geometry) =>
          scale = 1.18
          material = new THREE.MeshNormalMaterial()
          mesh = new THREE.Mesh(geometry, material)
          mesh.scale.set(scale, scale, scale)
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
          scene.add(mesh)
          rotationControls = new D.RotationController(el: @el, object: mesh, renderController: @renderController)

      return [scene, camera]

    initComposers = (renderer, width, height) ->
      parameters =
        minFilter: THREE.LinearFilter
        magFilter: THREE.LinearFilter
        format: THREE.RGBAFormat
        stencilBuffer: true

      backgroundTarget = new THREE.WebGLRenderTarget(width, height, parameters)
      backgroundComposer = new THREE.EffectComposer(renderer, backgroundTarget)

      foregroundTarget = new THREE.WebGLRenderTarget(width, height, parameters)
      foregroundComposer = new THREE.EffectComposer(renderer, foregroundTarget)

      [backgroundScene, ortographicCamera] = initBackground(width, height)
      [foregroundScene, perspectiveCamera] = initForeground(width, height)

      renderBackground = new THREE.RenderPass(backgroundScene, ortographicCamera)

      hBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras.horizontalBlur)
      vBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras.verticalBlur)

      hBlurPass1.uniforms.h.value = bluriness1 / width
      vBlurPass1.uniforms.v.value = bluriness1 / height

      hBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras.horizontalBlur)
      vBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras.verticalBlur)
      vBlurPass2.renderToScreen = true

      hBlurPass2.uniforms.h.value = bluriness2 / width
      vBlurPass2.uniforms.v.value = bluriness2 / height

      renderForeground = new THREE.RenderPass(foregroundScene, perspectiveCamera)
      renderForeground.clear = false

      vignettePass = new THREE.ShaderPass(THREE.ShaderExtras.vignette)
      vignettePass.uniforms.offset.value = 0.8
      vignettePass.uniforms.darkness.value = 2
      vignettePass.renderToScreen = true

      backgroundComposer.addPass(renderBackground)
      backgroundComposer.addPass(hBlurPass1)
      backgroundComposer.addPass(vBlurPass1)
      backgroundComposer.addPass(hBlurPass2)
      backgroundComposer.addPass(vBlurPass2)

      foregroundComposer.addPass(renderForeground)
      foregroundComposer.addPass(vignettePass)

      return [backgroundComposer, foregroundComposer]

    [backgroundComposer, foregroundComposer] = initComposers(@renderController.renderer, width, height)

    @renderController.on 'beforeRender', ->
      return unless rotationControls
      accuracy = rotationControls.accuracy
      bluriness1 = maxBluriness1 * accuracy
      bluriness2 = maxBluriness2 * accuracy
      hBlurPass1.uniforms.h.value = bluriness1 / width
      vBlurPass1.uniforms.v.value = bluriness1 / height
      hBlurPass2.uniforms.h.value = bluriness2 / width
      vBlurPass2.uniforms.v.value = bluriness2 / height

    @renderController.on 'afterRender', ->
      backgroundComposer.render()
      foregroundComposer.render()
