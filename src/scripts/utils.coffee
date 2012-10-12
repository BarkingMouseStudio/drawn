D.random = (min=-1, max=1) ->
  return Math.random() * (max - min) + min

D.loadGeometry = (url) ->
  deferred = new Deferred()
  loader = new THREE.GeometryLoader()
  loader.addEventListener 'error', (event) ->
    deferred.reject(new Error(event.message))
  loader.addEventListener 'load', (event) ->
    deferred.resolve(event.content)
  loader.load(url)
  return deferred.promise()

D.degreesToRadians = (degrees) ->
  return degrees * (Math.PI / 180)

D.radiansToDegrees = (radians) ->
  return radians * (180 / Math.PI)

D.createBoundingCubeFromObject = (mesh) ->
  { geometry } = mesh
  geometry.computeBoundingBox()
  { boundingBox } = geometry

  # Compute dimensions
  width = Math.abs(boundingBox.max.x - boundingBox.min.x)
  height = Math.abs(boundingBox.max.y - boundingBox.min.y)
  depth = Math.abs(boundingBox.max.z - boundingBox.min.z)

  # Compute translation center
  boundingBoxMidpoint = boundingBox.min.clone()
    .addSelf(boundingBox.max)
    .divideScalar(2)

  cubeGeometry = new THREE.CubeGeometry(width, height, depth)
  cubeGeometry.applyMatrix(new THREE.Matrix4()
    .setRotationFromEuler(mesh.parent.rotation)
    .translate(boundingBoxMidpoint))

  cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x66ff88,
    wireframe: true
  })
  cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
  return cubeMesh
