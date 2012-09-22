class D.EffectController extends Backbone.View
  constructor: ->
    super
    @renderController = @options.renderController

    initCamera = (width, height) ->
      viewAngle = 10 # fov
      aspectRatio = width / height

      camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000)
      camera.position.z = 365
      return camera

    initLights = (scene) ->
      ambientLight = new THREE.AmbientLight(0x222222)
      scene.add(ambientLight)

      pointLight = new THREE.PointLight(0xffffff, 1, 500)
      pointLight.position.set(250, 250, 250)
      scene.add(pointLight)

    initBackground = (halfWidth, halfHeight) ->
      camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10000, 10000)
      camera.position.z = 100

      material = new THREE.MeshBasicMaterial
        map: THREE.ImageUtils.loadTexture('images/sleeping_woman.png')
        depthTest: false

      size = 1800
      aspectRatio = 1230 / 1510

      mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
      mesh.position.y = 45
      mesh.position.z = -100
      mesh.scale.set(size * aspectRatio, size, 1)

      scene = new THREE.Scene()
      scene.add(mesh)
      return [scene, camera]

    initDeferredMesh = (scene) =>
      return D.loadGeometry('models/sleeping_woman_extruded.js')
        .pipe (geometry) =>
          material = new THREE.MeshNormalMaterial()
          mesh = new THREE.Mesh(geometry, material)
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
          scene.add(mesh)

          rotationControls = new D.RotationController(el: @el, object: mesh, renderController: @renderController)

          return mesh

    initForeground = (width, height) ->
      camera = initCamera(width, height)

      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0xffffff, 0.002)

      initLights(scene)
      initDeferredMesh(scene)

      return [scene, camera]

    initComposers = (renderer, width, height) ->
      renderTarget = new THREE.WebGLRenderTarget width, height, parameters =
        minFilter: THREE.LinearFilter
        magFilter: THREE.LinearFilter
        format: THREE.RGBAFormat
        stencilBuffer: true

      # Builds up layers to render to the `renderTarget`
      effectComposer = new THREE.EffectComposer(renderer, renderTarget)

      # Intialize the scenes and cameras for their `RenderPass`
      [backgroundScene, ortographicCamera] = initBackground(width / 2, height / 2)
      [foregroundScene, perspectiveCamera] = initForeground(width, height)

      backgroundPass = new THREE.RenderPass(backgroundScene, ortographicCamera)
      foregroundPass = new THREE.RenderPass(foregroundScene, perspectiveCamera)

      foregroundMaskPass = new THREE.MaskPass(foregroundScene, perspectiveCamera)
      foregroundMaskPass.inverse = true

      clearMaskPass = new THREE.ClearMaskPass()

      # We disable clearing on this pass or it would clear the `backgroundPass`
      # "behind" it. The default is `clear = true` so `backgroundPass` implicitly
      # clears itself.
      foregroundPass.clear = false

      # Apparently the `EffectComposer` requires at least one `ShaderPass` to
      # render anything? There are a bunch of these in THREE.ShaderExtras
      # including a vinette effect and depth-of-field. `screen` appears to be a
      # normal render with no effects. Note: there's also a `SavePass` which might
      # have the effect of simply rendering the scene without a `ShaderPass`.

      # Running two blur passes to hide blocks created by first blur pass
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

      # All `ShaderPass`'s require `renderToScreen` to do that. Otherwise the
      # layers "behind" them won't render. I don't know why you would want it to
      # be `false`.
      vignettePass.renderToScreen = true

      # Add all of the render passes in the order you want them to render (like
      # Photoshop layers).
      effectComposer.addPass(backgroundPass)
      effectComposer.addPass(foregroundPass)
      effectComposer.addPass(foregroundMaskPass)
      effectComposer.addPass(hBlurPass1)
      effectComposer.addPass(vBlurPass1)
      effectComposer.addPass(hBlurPass2)
      effectComposer.addPass(vBlurPass2)
      effectComposer.addPass(clearMaskPass)
      effectComposer.addPass(vignettePass)

      return effectComposer

    effectComposer = initComposers(@renderController.renderer, window.innerWidth, window.innerHeight)

    @renderController.on 'afterRender', ->
      effectComposer.render(0.1)
