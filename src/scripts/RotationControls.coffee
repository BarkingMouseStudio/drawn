class D.RotationControls
  isMouseDown: false

  deceleration: 0.05
  scale: 0.02

  initialRotationX: 0
  initialRotationY: 0
  mouseX: 0
  mouseY: 0
  initialMouseX: 0
  initialMouseY: 0
  rotationX: 0
  rotationY: 0

  constructor: (@object, @el=document) ->
    @halfWidth = window.innerWidth / 2
    @halfHeight = window.innerHeight / 2

    @el.addEventListener('mousedown', @onMouseDown, false)
    @el.addEventListener('mousemove', @onMouseMove, false)
    @el.addEventListener('mouseup', @onMouseUp, false)

  onMouseDown: (e) =>
    e.preventDefault()
    @isMouseDown = true

    @initialMouseX = e.clientX - @halfWidth
    @initialMouseY = e.clientY - @halfHeight
    @initialRotationX = @rotationX
    @initialRotationY = @rotationY

  onMouseMove: (e) =>
    return unless @isMouseDown

    @mouseX = e.clientX - @halfWidth
    @mouseY = e.clientY - @halfWidth

    @rotationX = @initialRotationX + (@mouseX - @initialMouseX) * @scale
    @rotationY = @initialRotationY + (@mouseY - @initialMouseY) * @scale

  onMouseUp: (e) =>
    e.preventDefault()
    @isMouseDown = false

  update: ->
    @object.rotation.x += (@rotationY - @object.rotation.x) * @deceleration
    @object.rotation.y += (@rotationX - @object.rotation.y) * @deceleration
