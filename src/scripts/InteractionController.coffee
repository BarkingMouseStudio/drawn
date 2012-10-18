class D.InteractionController extends Backbone.View
  mouseDown: false

  deceleration: 0.02
  drag: 0.9

  constructor: (@options) ->
    super

    { @camera } = @options

    @$el.on('mousedown', @onMouseDown)
    @$el.on('mousemove', @onMouseMove)
    @$el.on('mouseup', @onMouseUp)

    @initMouse = new THREE.Vector3(0, 0, 1)
    @mouse = new THREE.Vector3(0, 0, 1)
    @projector = new THREE.Projector()

    @rotationalVelocity = new THREE.Vector3()
    @rotationalAcceleration = new THREE.Vector3()

  setObject: (@object) =>

  projectMouse: (objects) ->
    mouse = @initMouse.clone()
    @projector.unprojectVector(mouse, @camera)
    ray = new THREE.Ray(@camera.position,
      mouse.subSelf(@camera.position)
        .normalize())
    intersects = ray.intersectObjects(objects)
    return intersects[0]

  updateMouseVector: (mouse, e) =>
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

  onMouseUp: (e) =>
    @mouseDown = false
    @direction = null

  onMouseDown: (e) =>
    @mouseDown = true

    @updateMouseVector(@mouse, e)
    @initMouse.copy(@mouse)

    _.each @object.children, (object) ->
      { material } = object
      material.opacity = 0.8
      material.needsUpdate = true

    nearest = @projectMouse(@object.children)

    @activeObject = if nearest then nearest.object else null

    return unless @activeObject

    { material } = @activeObject
    material.opacity = 1.0

    boundingCube = @activeObject.getChildByName('boundingCube')
    nearest = @projectMouse([boundingCube])

    @activeNormal = if nearest then nearest.face.normal.clone()
      .addSelf(@activeObject.rotation) else null

  onMouseMove: (e) =>
    return unless @mouseDown and @object
    @updateMouseVector(@mouse, e)

    mouseDirection = @mouse.clone()
      .subSelf(@initMouse)
      .normalize()

    unless @activeNormal
      @rotationalAcceleration.addSelf(new THREE.Vector3(-mouseDirection.y, mouseDirection.x, 0))
    else
      unless @direction
        @direction = D.snapVector(mouseDirection.clone())
      @rotationalAcceleration.addSelf(new THREE.Vector3(-@direction.y, @direction.x, 0))

    @initMouse.copy(@mouse)

  update: =>
    return unless @object

    @rotationalAcceleration.multiplyScalar(@deceleration)
    @rotationalVelocity.addSelf(@rotationalAcceleration)

    if @activeObject?
      @activeObject.rotation.addSelf(@rotationalVelocity)
    else
      @object.rotation.addSelf(@rotationalVelocity)

    @rotationalVelocity.multiplyScalar(@drag)
