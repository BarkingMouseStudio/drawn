class D.InteractionController extends Backbone.View
  # Represents mouse down state
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
    @initMouse = new THREE.Vector3(0, 0, 1)

    # The current mouse position
    @mouse = new THREE.Vector3(0, 0, 1)

    # Projector used to map intersection ray to camera
    @projector = new THREE.Projector()

    # Current rotation to be applied
    @rotationalVelocity = new THREE.Vector3()
    @rotationalAcceleration = new THREE.Vector3()

  # Set the object to rotate
  setObject: (@object) =>

  # Project the mouse to create an intersection
  projectMouse: (objects) ->
    mouse = @initMouse.clone()
    @projector.unprojectVector(mouse, @camera)
    ray = new THREE.Ray(@camera.position,
      mouse.subSelf(@camera.position)
        .normalize())
    intersects = ray.intersectObjects(objects)
    return intersects[0]

  # Updates a vector with the current mouse coordinates
  updateMouseVector: (mouse, e) =>
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

  # Reset the interaction state
  onMouseUp: (e) =>
    @mouseDown = false
    @partialObject = null
    @activeNormal = null
    @mouseDirection = null

  onMouseDown: (e) =>
    @mouseDown = true

    @updateMouseVector(@mouse, e)
    @initMouse.copy(@mouse)

    _.each @object.children, (object) ->
      { material } = object
      material.opacity = 0.8
      material.needsUpdate = true

    nearest = @projectMouse(@object.children)

    @partialObject = if nearest then nearest.object else null

    return unless @partialObject

    # Update the active object opacity
    { material } = @partialObject
    material.opacity = 1.0

    # Update the normal on the active object
    boundingCube = @partialObject.getChildByName('boundingCube')
    nearest = @projectMouse([boundingCube])

    @activeNormal = if nearest then nearest.face.normal.clone()
      .addSelf(@partialObject.rotation) else null

      # 
  onMouseMove: (e) =>
    return unless @mouseDown and @object
    @updateMouseVector(@mouse, e)

    mouseDirection = @mouse.clone()
      .subSelf(@initMouse)

    unless @activeNormal
      rotation = new THREE.Vector3(-mouseDirection.y, mouseDirection.x, 0)
    else
      unless @mouseDirection
        @mouseDirection = D.snapVector(mouseDirection.clone())
        @mouseDirection.multiplyScalar(0.2)
      rotation = new THREE.Vector3(0, @mouseDirection.x, -@mouseDirection.y)

    @rotationalAcceleration.addSelf(rotation)
    @initMouse.copy(@mouse)

  update: =>
    # Don't update anything if we don't have an object
    return unless @object

    # Update active object rotation
    @rotationalAcceleration.multiplyScalar(@deceleration)
    @rotationalVelocity.addSelf(@rotationalAcceleration)

    if @partialObject?
      @partialObject.rotation.addSelf(@rotationalVelocity)
    else
      @object.rotation.addSelf(@rotationalVelocity)

    @rotationalVelocity.multiplyScalar(@drag)
