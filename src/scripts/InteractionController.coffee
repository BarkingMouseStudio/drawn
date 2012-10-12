class D.InteractionController extends Backbone.View
  mouseDown: false

  deceleration: 0.15
  drag: 0.9

  constructor: (@options) ->
    super

    { @camera } = @options

    @$el.on('mousedown', @onMouseDown)
    @$el.on('mousemove', @onMouseMove)
    @$el.on('mouseup', @onMouseUp)

    @initMouse = new THREE.Vector3()
    @mouse = new THREE.Vector3()
    @projector = new THREE.Projector()

    @rotationalVelocity = new THREE.Vector3()
    @rotationalAcceleration = new THREE.Vector3()

  setObject: (@object) =>
    @parentObject = new THREE.Object3D()
    @boxes = new THREE.Object3D()
    @object.children.forEach (object) =>
      @boxes.add(D.createBoundingCubeFromObject(object))
    @parentObject.add(@object)
    @parentObject.add(@boxes)

  onMouseDown: (e) =>
    @mouseDown = true

    @initMouse.x = @mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    @initMouse.y = @mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    unless @object?.children.length
      return

    mouse = @initMouse.clone()
    @projector.unprojectVector(mouse, @camera)

    ray = new THREE.Ray(@camera.position,
      mouse.subSelf(@camera.position)
        .normalize())
    intersects = ray.intersectObjects(@object.children)
    nearest = intersects[0]

    _.each @object.children, (object) ->
      object.material.opacity = 0.8
      object.material.needsUpdate = true

    @activeObject = nearest?.object

    if @activeObject
      @activeObject.material.opacity = 1.0
      @activeObject.material.needsUpdate = true

      box = @boxes.children[_.indexOf(@object.children, @activeObject)]
      intersects = ray.intersectObject(box)
      if intersects
        normal = intersects[0].face.normal

  onMouseUp: (e) =>
    @mouseDown = false

  onMouseMove: (e) =>
    @mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    @mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

    unless @mouseDown
      return

    @dragging = true

    mouseDiff = @mouse.clone()
      .subSelf(@initMouse)
      .multiplyScalar(Math.PI)

    @rotationalAcceleration.addSelf(new THREE.Vector3(-mouseDiff.y, mouseDiff.x, 0))

    @initMouse.x = @mouse.x
    @initMouse.y = @mouse.y

    # if @activeObject
    #   @onDragObject(e)
    # else
    #   @onDragGroup(e)

  # onDragObject: (e) =>
    # console.warn 'dragging object'

  # onDragGroup: (e) =>
    # console.warn 'dragging group'

  update: =>
    unless @object
      return

    @rotationalAcceleration.multiplyScalar(@deceleration)
    @rotationalVelocity.addSelf(@rotationalAcceleration)

    if @activeObject?
      @activeObject.rotation.addSelf(@rotationalVelocity)
    else
      @parentObject.rotation.addSelf(@rotationalVelocity)

    @rotationalVelocity.multiplyScalar(@drag)
