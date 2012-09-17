class D.RotationControls
  mouseDown: false

  deceleration: 0.05
  scale: 0.02

  rotationX: 0
  rotationY: 0
  initialRotationX: 0
  initialRotationY: 0
  mouseX: 0
  mouseY: 0
  initialMouseX: 0
  initialMouseY: 0

  constructor: (@object, @el=document) ->
    @halfWidth = window.innerWidth / 2
    @halfHeight = window.innerHeight / 2

    @el.addEventListener('mousedown', @onMouseDown, false)
    @el.addEventListener('mousemove', @onMouseMove, false)
    @el.addEventListener('mouseup', @onMouseUp, false)

  onMouseDown: (e) ->
    e.preventDefault()
    @mouseDown = true

    @initialMouseX = e.clientX - @halfWidth
    @initialMouseY = e.clientY - @halfHeight
    @initialRotationX = @rotationX
    @initialRotationY = @rotationY

  onMouseMove: (e) ->
    return unless @mouseDown

    @mouseX = e.clientX - @halfWidth
    @mouseY = e.clientY - @halfWidth

    @rotationX = @initialRotationX + (@mouseX - @initialMouseX) * @scale
    @rotationY = @initialRotationY + (@mouseY - @initialMouseY) * @scale

  onMouseUp: (e) ->
    e.preventDefault()
    @mouseDown = false

  update: ->
    @object.rotation.y += (@rotationX - @object.rotation.y) * @deceleration
    @object.rotation.x += (@rotationY - @object.rotation.x) * @deceleration
