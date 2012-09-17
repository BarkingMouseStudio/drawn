# Main flow: 
# * Initialize the foreground and background scenes
document.onselectstart = -> false

width = window.innerWidth
height = window.innerHeight

halfWidth = width / 2
halfHeight = height / 2

initParticles = (scene) ->
  particleCount = 100
  particles = new THREE.Geometry()

  material = new THREE.ParticleBasicMaterial
    color: 0x000000
    size: 20
    map: THREE.ImageUtils.loadTexture('images/ash.png')
    blending: THREE.NormalBlending
    transparent: true

  for i in [0..particleCount]
    particles.vertices.push(new D.Particle3D())

  particleSystem = new THREE.ParticleSystem(particles, material)
  particleSystem.dynamic = true
  particleSystem.sortParticles = true
  scene.add(particleSystem)
  return particleSystem

updateParticles = ->
  particleSystemGeometry = particleSystem.geometry
  particles = particleSystemGeometry.vertices
  particleCount = particles.length

  while particleCount--
    particles[particleCount].update()

  particleSystemGeometry.verticesNeedUpdate = true

initStats = ->
  stats = new Stats()
  document.body.appendChild(stats.domElement)
  return stats

initCamera = (width, height) ->
  viewAngle = 45
  aspectRatio = width / height
  near = 1
  far = 10000

  scale = 0.4
  scaledHalfWidth = halfWidth * scale
  scaledHalfHeight = halfHeight * scale

  # camera = new THREE.OrthographicCamera(-scaledHalfWidth, scaledHalfWidth, scaledHalfHeight, -scaledHalfHeight, near, far)
  camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far)
  camera.position.z = 1000
  return camera

initLights = (scene) ->
  ambientLight = new THREE.AmbientLight(0x222222)
  scene.add(ambientLight)

  pointLight = new THREE.PointLight(0xffffff, 1, 500)
  pointLight.position.set(250, 250, 250)
  scene.add(pointLight)

initRenderer = (width, height) ->
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  # Set the color to paint the background when its cleaered by the renderer
  renderer.setClearColorHex(0x000000, 1)

  # We call `renderer.clear` manually in the render loop because of the
  # way the EffectComposer expects its layers to clear
  renderer.autoClear = false

  # Append a canvas element to the body
  document.body.appendChild(renderer.domElement)

  return renderer

# Initialize the background image that will be rendered behind the main scene
initBackground = ->
  camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10000, 10000)
  camera.position.z = 100

  # NOTE: Since we're using an `OrthographicCamera` the `z` position has no
  # effect beyond needing the object to be in front of the camera

  material = new THREE.MeshBasicMaterial
    map: THREE.ImageUtils.loadTexture('images/sleeping_woman.png')
    depthTest: false

  # Scales the image
  size = 665

  # The aspect ratio
  aspectRatio = 1230 / 1510

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  mesh.position.y = 65
  mesh.position.z = -1000
  mesh.scale.set(size * aspectRatio, size, 1)

  scene = new THREE.Scene()
  scene.add(mesh)
  return [scene, camera]

# Globals that need to be updated in the render loop but are called too deep
# to be cleanly bubbled up like the stats object
rotationControls = null
particleSystem = null

# Async load geometry into a mesh and add it to the scene
initDeferredMesh = (scene) ->
  # NOTE: `initDeferredMesh` doesn't return the mesh directly but a `Promise`.
  # You could use the mesh later like this:
  # ```
  # meshPromise = initDeferredMesh(scene)
  # meshPromise.done (mesh) ->
  #   console.log('this is the mesh', mesh)
  # ```
  return D.loadGeometry('models/sleeping_woman_extruded.js')
    .pipe (geometry) ->
      material = new THREE.MeshNormalMaterial()
      mesh = new THREE.Mesh(geometry, material)
      mesh.scale.set(18, 18, 18)
      scene.add(mesh)

      # Initialize the mouse controls for rotating the object
      rotationControls = new D.RotationControls(mesh)

      return mesh

# Initializes the foreground scene with the shape model
initForeground = ->
  camera = initCamera(width, height)

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xffffff, 0.002)

  initLights(scene)
  initDeferredMesh(scene)

  particleSystem = initParticles(scene)
  return [scene, camera]

initComposer = (renderer) ->
  # Intialize a render target. This is used as a secondary buffer to render
  # images to before they're finally rendered onto the main `renderer`.
  renderTarget = new THREE.WebGLRenderTarget width, height, parameters =
    minFilter: THREE.LinearFilter
    magFilter: THREE.LinearFilter
    format: THREE.RGBAFormat
    stencilBuffer: false

  # Builds up layers to render to the `renderTarget`
  effectComposer = new THREE.EffectComposer(renderer, renderTarget)

  # Intialize the scenes and cameras for their `RenderPass`
  [backgroundScene, ortographicCamera] = initBackground()
  [foregroundScene, perspectiveCamera] = initForeground()

  backgroundPass = new THREE.RenderPass(backgroundScene, ortographicCamera)
  foregroundPass = new THREE.RenderPass(foregroundScene, perspectiveCamera)

  # We disable clearing on this pass or it would clear the `backgroundPass`
  # "behind" it. The default is `clear = true` so `backgroundPass` implicitly
  # clears itself.
  foregroundPass.clear = false

  # Apparently the `EffectComposer` requires at least one `ShaderPass` to
  # render anything. There are a bunch of these in THREE.ShaderExtras
  # including a vinette effect and depth-of-field. `screen` appears to be a
  # normal render with no effects.
  screenPass = new THREE.ShaderPass(THREE.ShaderExtras['screen'])

  # All `ShaderPass`'s require `renderToScreen` to do that. Otherwise the
  # layers "behind" them won't render. I don't know why you would want it to
  # be `false`.
  screenPass.renderToScreen = true

  # Add all of the render passes in the order you want them to render (like
  # Photoshop layers).
  effectComposer.addPass(backgroundPass)
  effectComposer.addPass(foregroundPass)
  effectComposer.addPass(screenPass)

  return effectComposer

# Initialize the built-in Three.js stats monitor in the bottom right corner
stats = initStats()

# Initialize the renderer that is responsible for outputing the final rendered
# image. Ordinarily we would call `renderer.render()` but the `EffectComposer`
# does that for us.
renderer = initRenderer(width, height)

# Initialize the effectComposer which will compose the foreground and background
# images into a single rendered image
effectComposer = initComposer(renderer)

# Main render loop passed into `requestAnimationFrame` 
update = ->
  # The more efficient equivalent to `setTimeout` (takes into account browser
  # visibility and pauses render as needed)
  requestAnimationFrame(update)

  # Update the particles positions
  updateParticles()

  # Update the rotation of the object the rotation control was given when it 
  # was initialized (using existential operator because the controls and mesh
  # the controls are bound to may not exist yet)
  rotationControls?.update()

  # Clear the renderer so anything translucent in the next rendered frame
  # does not leave a ghost image
  renderer.clear()

  # Call render on the `effectComposer` which will internally pass its
  # results to the renderer it was given when the `effectComposer` was
  # initialized
  effectComposer.render(0.1)

  # Tell the stats monitor to update
  stats.update()

update()
