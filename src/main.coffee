document.onselectstart = -> false

particle_bounds = 500
gravity = new THREE.Vector3(0, -9.8, 0)

class Particle3D extends THREE.Vector3
  constructor: ->
    @drag = 0.00015
    @mass = random(0, 1)
    @set(random(-particle_bounds, particle_bounds),
         random(-particle_bounds, particle_bounds),
         random(-particle_bounds, particle_bounds))
    @velocity = new THREE.Vector3(random(), random(), random()) 
    @acceleration = new THREE.Vector3(0, 0, 0)

  update: ->
    if @x < -particle_bounds
      @x = particle_bounds
    else if @x > particle_bounds
      @x = -particle_bounds

    if @y < -particle_bounds
      @y = particle_bounds
    else if @y > particle_bounds
      @y = -particle_bounds

    if @z < -particle_bounds
      @z = particle_bounds
    else if @z > particle_bounds
      @z = -particle_bounds

    @acceleration.multiplyScalar(0)
    @acceleration.addSelf(gravity)
    @acceleration.multiplyScalar(@mass)
    @acceleration.multiplyScalar(@drag)

    @velocity.addSelf(@acceleration)

    @addSelf(@velocity)

random = (min=-1, max=1) ->
  return Math.random() * (max - min) + min

random_int = (min, max) ->
  return Math.floor(random(min, max))

bind = (val, fn) -> fn(val)

width = window.innerWidth
height = window.innerHeight

half_width = width / 2
half_height = height / 2

particle_system = null
camera_controls = null

init_particle = (particle) ->
  [px, py, pz] = [random(-particle_bounds, particle_bounds),
                  random(-particle_bounds, particle_bounds),
                  random(-particle_bounds, particle_bounds)]
  [ax, ay, az] = [0, 0, 0]
  [vx, vy, vz] = [random(), random(), random()]

  particle.set(px, py, pz)
  particle.acceleration.set(ax, ay, az)
  particle.velocity.set(vx, vy, vz)
  particle.mass = random(0, 1)
  return particle

init_particles = (scene) ->
  particle_count = 100
  particles = new THREE.Geometry()

  material = new THREE.ParticleBasicMaterial
    color: 0x000000
    size: 20
    map: THREE.ImageUtils.loadTexture('images/ash.png')
    blending: THREE.NormalBlending
    transparent: true

  for i in [0..particle_count]
    particles.vertices.push(new Particle3D())

  particle_system = new THREE.ParticleSystem(particles, material)
  particle_system.dynamic = true
  particle_system.sortParticles = true
  scene.add(particle_system)
  return particle_system

update_particles = ->
  particle_system_geometry = particle_system.geometry
  particles = particle_system_geometry.vertices
  p_count = particles.length

  while p_count--
    particles[p_count].update()

  particle_system_geometry.verticesNeedUpdate = true

init_stats = ->
  stats = new Stats()
  document.body.appendChild(stats.domElement)
  return stats

init_camera = (width, height) ->
  view_angle = 45
  aspect_ratio = width / height
  near = 1
  far = 10000

  camera = new THREE.PerspectiveCamera(view_angle, aspect_ratio, near, far)
  camera.position.z = 300
  controls = new THREE.TrackballControls(camera)
  return [camera, controls]

init_lights = (scene) ->
  ambient_light = new THREE.AmbientLight(0x222222)
  scene.add(ambient_light)

  point_light = new THREE.PointLight(0xffffff, 1, 500)
  point_light.position.set(250, 250, 250)
  scene.add(point_light)

init_scene = ->
  scene = new THREE.Scene()
  # scene.fog = new THREE.FogExp2(0xffffff, 0.002)
  return scene

init_cube = (scene) ->
  geometry = new THREE.CubeGeometry(100, 100, 100)
  material = new THREE.MeshLambertMaterial(color: 0x888888)
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

init_renderer = (width, height) ->
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.setClearColorHex(0x000000, 1)
  renderer.autoClear = false

  document.body.appendChild(renderer.domElement)

  return renderer

init_background = ->
  camera = new THREE.OrthographicCamera(-half_width, half_width, half_height, -half_height, -10000, 10000)
  camera.position.z = 100

  material = new THREE.MeshBasicMaterial
    map: THREE.ImageUtils.loadTexture('images/vitruvian.jpg')
    depthTest: false

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  mesh.position.z = -500
  mesh.scale.set(2000 * (1385 / 2001), 2000, 1)

  scene = new THREE.Scene()
  scene.add(mesh)
  return [scene, camera]

init_foreground = ->
  [camera, camera_controls] = init_camera(width, height)
  scene = init_scene()
  init_lights(scene)
  init_cube(scene)
  particle_system = init_particles(scene)
  return [scene, camera]

init_composer = (renderer) ->
  render_target = new THREE.WebGLRenderTarget width, height, parameters =
    minFilter: THREE.LinearFilter
    magFilter: THREE.LinearFilter
    format: THREE.RGBAFormat
    stencilBuffer: false

  composer = new THREE.EffectComposer(renderer, render_target)

  [background_scene, ortographic_camera] = init_background()
  [foreground_scene, perspective_camera] = init_foreground()

  background_pass = new THREE.RenderPass(background_scene, ortographic_camera)

  foreground_pass = new THREE.RenderPass(foreground_scene, perspective_camera)
  foreground_pass.clear = false

  screen_pass = new THREE.ShaderPass(THREE.ShaderExtras['screen'])
  screen_pass.renderToScreen = true

  composer.addPass(background_pass)
  composer.addPass(foreground_pass)
  composer.addPass(screen_pass)

  return composer

stats = init_stats()
renderer = init_renderer(width, height)
composer = init_composer(renderer)

animate = ->
  requestAnimationFrame(animate)

  update_particles()
  camera_controls.update()

  renderer.clear()
  composer.render(0.1)

  stats.update()

animate()
