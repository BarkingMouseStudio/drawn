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
