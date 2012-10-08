class D.ParticlesController extends Backbone.View
  constructor: ->
    super

    @scene = @options.scene
    @renderController = @options.renderController

    particleCount = 100
    particles = new THREE.Geometry()
    material = new THREE.ParticleBasicMaterial
      color: 0x000000
      size: 20
      map: THREE.ImageUtils.loadTexture('../images/ash.png')
      blending: THREE.NormalBlending
      transparent: true

    while particleCount--
      particle = new D.Particle3D()
      particles.vertices.push(particle)

    particleSystem = new THREE.ParticleSystem(particles, material)
    particleSystem.dynamic = true
    particleSystem.sortParticles = true
    @scene.add(particleSystem)

    @renderController.on 'beforeRender', =>
      particleSystemGeometry = particleSystem.geometry
      particles = particleSystemGeometry.vertices
      particleCount = particles.length
      while particleCount--
        particle = particles[particleCount]
        particle.update()
      particleSystemGeometry.verticesNeedUpdate = true
