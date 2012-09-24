class D.EffectController extends Backbone.View
  constructor: ->
    super
    @renderController = @options.renderController

    initBackground = (halfWidth, halfHeight) ->
      camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 100)
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

      D.loadGeometry('models/sleeping_woman_extruded.js')
        .done (geometry) =>
          material = new THREE.MeshNormalMaterial()
          mesh = new THREE.Mesh(geometry, material)
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
          scene.add(mesh)
          rotationControls = new D.RotationController(el: @el, object: mesh, renderController: @renderController)

      return [scene, camera]

    initComposers = (renderer, width, height) ->
      renderTarget = new THREE.WebGLRenderTarget width, height, parameters =
        minFilter: THREE.LinearFilter
        magFilter: THREE.LinearFilter
        format: THREE.RGBAFormat
        stencilBuffer: true

      effectComposer = new THREE.EffectComposer(renderer, renderTarget)

      [backgroundScene, ortographicCamera] = initBackground(width / 2, height / 2)
      [foregroundScene, perspectiveCamera] = initForeground(width, height)

      backgroundPass = new THREE.RenderPass(backgroundScene, ortographicCamera)
      foregroundPass = new THREE.RenderPass(foregroundScene, perspectiveCamera)
      foregroundPass.clear = false

      foregroundMaskPass = new THREE.MaskPass(foregroundScene, perspectiveCamera)
      foregroundMaskPass.inverse = true

      clearMaskPass = new THREE.ClearMaskPass()

      hBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras['horizontalBlur'])
      vBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras['verticalBlur'])

      bluriness = 16
      hBlurPass1.uniforms['h'].value = bluriness / width
      vBlurPass1.uniforms['v'].value = bluriness / height

      hBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras['horizontalBlur'])
      vBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras['verticalBlur'])

      bluriness = 4
      hBlurPass2.uniforms['h'].value = bluriness / width
      vBlurPass2.uniforms['v'].value = bluriness / height

      vignettePass = new THREE.ShaderPass(THREE.ShaderExtras['vignette'])
      vignettePass.uniforms['offset'].value = 0.8
      vignettePass.uniforms['darkness'].value = 2
      vignettePass.renderToScreen = true

      screenPass = new THREE.ShaderPass(THREE.ShaderExtras['screen'])
      screenPass.renderToScreen = true

      effectComposer.addPass(backgroundPass)
      effectComposer.addPass(foregroundPass)
      effectComposer.addPass(screenPass)
      # effectComposer.addPass(foregroundMaskPass)
      # effectComposer.addPass(hBlurPass1)
      # effectComposer.addPass(vBlurPass1)
      # effectComposer.addPass(hBlurPass2)
      # effectComposer.addPass(vBlurPass2)
      # effectComposer.addPass(clearMaskPass)
      # effectComposer.addPass(vignettePass)

      return effectComposer

    effectComposer = initComposers(@renderController.renderer, window.innerWidth, window.innerHeight)

    @renderController.on 'afterRender', ->
      effectComposer.render(0.1)
