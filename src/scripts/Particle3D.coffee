class D.Particle3D extends THREE.Vector3
  @drag: 0.00015
  @gravity: new THREE.Vector3(0, -9.8, 0)

  age: 0
  lifespan: 100
  mass: 1

  constructor: ->
    @acceleration = new THREE.Vector3(0, 0, 0)
    @velocity = new THREE.Vector3(0, 0, 0) 

  update: ->
    @acceleration.multiplyScalar(0)
    @acceleration.addSelf(D.Particle3D.gravity)
    @acceleration.multiplyScalar(@mass)

    @acceleration.multiplyScalar(0)
    @velocity.addSelf(@acceleration)
    @velocity.multiplyScalar(D.Particle3D.drag)

    @addSelf(@velocity)
