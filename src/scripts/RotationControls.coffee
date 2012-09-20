width = window.innerWidth
height = window.innerHeight

halfWidth = width / 2
halfHeight = height / 2

class D.RotationControls
  isMouseDown: false

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
    @object.rotationAcceleration.multiplyScalar(scale = 0.5)
    @object.rotationVelocity.addSelf(@object.rotationAcceleration)
    @object.rotation.addSelf(@object.rotationVelocity)
    @object.rotationVelocity.multiplyScalar(drag = 0.9)

    { x, y } = @object.rotation

    if x > D.TWO_PI or x < -D.TWO_PI
      @object.rotation.x = x = 0

    if y > D.TWO_PI or y < -D.TWO_PI
      @object.rotation.y = y = 0

    # Should be a percentage of the full range
    solutionThreshold = 5
    pX = (Math.abs(x) / Math.PI) * 100
    pY = (Math.abs(y) / Math.PI) * 100
    if pX + pY < solutionThreshold
      console.warn 'SOLUTION', pX, pY

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
