width = window.innerWidth
height = window.innerHeight

halfWidth = width / 2
halfHeight = height / 2

class D.RotationControls
  isMouseDown: false

  scale: 0.5
  drag: 0.9

  disabled: false
  maxSpeed: 0.2
  solutionThreshold: 2

  mouseX: 0
  mouseY: 0
  initMouseX: 0
  initMouseY: 0

  constructor: (@object, @el=document) ->
    @object.rotationAcceleration = new THREE.Vector3()
    @object.rotationVelocity = new THREE.Vector3()

    @el.addEventListener('mousedown', @onMouseDown, false)
    @el.addEventListener('mousemove', @onMouseMove, false)
    @el.addEventListener('mouseup', @onMouseUp, false)

  onMouseDown: (e) =>
    e.preventDefault()
    @isMouseDown = true

    @initMouseX = e.clientX - halfWidth
    @initMouseY = e.clientY - halfHeight

  onMouseMove: (e) =>
    return unless @isMouseDown

    @mouseX = e.clientX - halfWidth
    @mouseY = e.clientY - halfHeight

    @mouseDX = @mouseX - @initMouseX
    @mouseDY = @mouseY - @initMouseY

    @mouseDXScaled = (@mouseDX / width) * Math.PI
    @mouseDYScaled = (@mouseDY / height) * Math.PI

    @object.rotationAcceleration.addSelf(new THREE.Vector3(@mouseDYScaled, @mouseDXScaled, 0))

    @initMouseX = @mouseX
    @initMouseY = @mouseY

  onMouseUp: (e) =>
    e.preventDefault()
    @isMouseDown = false

  update: ->
    return if @disabled

    @object.rotationAcceleration.multiplyScalar(@scale)
    @object.rotationVelocity.addSelf(@object.rotationAcceleration)
    @object.rotation.addSelf(@object.rotationVelocity)
    @object.rotationVelocity.multiplyScalar(@drag)

    { x, y } = @object.rotation

    if x > D.TWO_PI
      @object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI
    else if x < -D.TWO_PI
      @object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI

    if y > D.TWO_PI
      @object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI
    else if y < -D.TWO_PI
      @object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI

    speed = @object.rotationVelocity.lengthSq()
    tooFast = speed > @maxSpeed

    accuracy = (@object.rotation.length() / D.TWO_PI) * 100

    if tooFast
      @object.rotationAcceleration.addSelf(@object.rotationVelocity.clone().negate())
    else if accuracy < @solutionThreshold
      console.warn 'SOLUTION', accuracy, speed
      @object.rotation.set(0, 0, 0)
      @disabled = true

    ###
    if @rotationX > twoPI
      @rotationX -= twoPI
    else if @rotationX < -twoPI
      @rotationX += twoPI

    if @rotationY > twoPI
      @rotationY -= twoPI
    else if @rotationY < -twoPI
      @rotationY += twoPI
      ###
