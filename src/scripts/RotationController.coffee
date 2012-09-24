width = window.innerWidth
height = window.innerHeight

halfWidth = width / 2
halfHeight = height / 2

class D.RotationController extends Backbone.View
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

  events:
    'mousedown': 'onMouseDown'
    'mousemove': 'onMouseMove'
    'mouseup': 'onMouseUp'

  constructor: ->
    super

    @object = @options.object

    @renderController = @options.renderController
    @renderController.on 'beforeRender', =>
      @update()

    @rotationAcceleration = new THREE.Vector3()
    @rotationVelocity = new THREE.Vector3()

  onMouseDown: (e) ->
    e.preventDefault()
    @isMouseDown = true
    @initMouseX = e.clientX - halfWidth
    @initMouseY = e.clientY - halfHeight

  onMouseMove: (e) ->
    return unless @isMouseDown
    @mouseX = e.clientX - halfWidth
    @mouseY = e.clientY - halfHeight
    @mouseDX = @mouseX - @initMouseX
    @mouseDY = @mouseY - @initMouseY
    @mouseDXScaled = (@mouseDX / width) * Math.PI
    @mouseDYScaled = (@mouseDY / height) * Math.PI
    @rotationAcceleration.addSelf(new THREE.Vector3(@mouseDYScaled, @mouseDXScaled, 0))
    @initMouseX = @mouseX
    @initMouseY = @mouseY

  onMouseUp: (e) ->
    e.preventDefault()
    @isMouseDown = false

  update: ->
    return if @disabled

    @rotationAcceleration.multiplyScalar(@scale)
    @rotationVelocity.addSelf(@rotationAcceleration)
    @object.rotation.addSelf(@rotationVelocity)
    @rotationVelocity.multiplyScalar(@drag)

    { x, y } = @object.rotation

    if x > D.TWO_PI
      @object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI
    else if x < -D.TWO_PI
      @object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI

    if y > D.TWO_PI
      @object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI
    else if y < -D.TWO_PI
      @object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI

    speed = @rotationVelocity.lengthSq()
    tooFast = speed > @maxSpeed

    accuracy = (@object.rotation.length() / D.TWO_PI) * 100

    if tooFast
      @rotationAcceleration.addSelf(@rotationVelocity.clone().negate())
    else if accuracy < @solutionThreshold
      console.warn 'SOLUTION', 'acc', accuracy, 'speed', speed
      @object.rotation.set(0, 0, 0)
      @disabled = true
