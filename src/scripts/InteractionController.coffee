class D.InteractionController extends Backbone.View
  mouseDown: false

  # Deceleration factor applied to the rotational acceleration every frame
  deceleration: 0.2

  # Drag factor applied to the rotational velocity every frame
  drag: 0.9

  constructor: (@options) ->
    super

    # Camera used to determine mouse/ray intersection
    { @camera } = @options

    # Setup event handlers (`@$el` is `document`)
    @$el.on('mousedown', @onMouseDown)
    @$el.on('mousemove', @onMouseMove)
    @$el.on('mouseup', @onMouseUp)

    # The initial mouse position on mouse down
    @prevMouse = new THREE.Vector3(0, 0, 1)

    # The current mouse position
    @currentMouse = new THREE.Vector3(0, 0, 1)

    # Projector used to map intersection ray to camera
    @projector = new THREE.Projector()

    # Current rotation to be applied
    @rotationalVelocity = new THREE.Vector3()
    @rotationalAcceleration = new THREE.Vector3()

  # Set the object to rotate
  setObject: (@object) =>

  # Project the mouse to create an intersection
  calculateIntersection: (mouse, objects) ->
    mouse = mouse.clone()
    @projector.unprojectVector(mouse, @camera)
    ray = new THREE.Ray(@camera.position,
      mouse.subSelf(@camera.position)
        .normalize())
    intersects = ray.intersectObjects(objects)
    return intersects[0]

  # Updates a vector with the current mouse coordinates
  getMouseVector: (e) =>
    mouseVector = new THREE.Vector3(0, 0, 1)
    mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1
    mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1
    return mouseVector

  # Reset the interaction state
  onMouseUp: (e) =>
    @currentMouseDown = false
    @partialObject = null
    @activeNormal = null
    @currentMouseDirection = null

  onMouseDown: (e) =>
    @count = 10

    @currentMouseDown = true

    @currentMouse = @getMouseVector(e)
    @prevMouse.copy(@currentMouse)

    _.each @object.children, (object) ->
      { material } = object
      material.opacity = 0.8
      material.needsUpdate = true

    nearestIntersection = @calculateIntersection(@currentMouse, @object.children)

    @partialObject = if nearestIntersection then nearestIntersection.object else null

    unless @partialObject
      return

    # Update the active object opacity
    { material } = @partialObject
    material.opacity = 1.0

    # Update the normal on the active object
    boundingCube = @partialObject.getChildByName('boundingCube')
    nearestIntersection = @calculateIntersection(@currentMouse, [boundingCube])

    if nearestIntersection
      nearestFace = nearestIntersection.face
      nearestNormal = nearestFace.normal.clone()
        .addSelf(@partialObject.rotation)
      @activeNormal = nearestNormal
    else
      @activeNormal = null

  onMouseMove: (e) =>
    return unless @currentMouseDown

    @currentMouse = @getMouseVector(e)

    mouseDirection = @currentMouse.clone().subSelf(@prevMouse)

    @quaternion = new THREE.Quaternion()
    @quaternion.setFromAxisAngle(new THREE.Vector3(-mouseDirection.y, mouseDirection.x, 0), Math.PI / 2)

    @prevMouse.copy(@currentMouse)

  update: =>
    return unless @object and @quaternion

    up = @object.up.clone()
    rotation = @quaternion.multiplyVector3(up)
    @object.rotation = rotation

    @quaternion = null
