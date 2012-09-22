class D.RenderController extends Backbone.View
  constructor: ->
    super
    @renderer = new THREE.WebGLRenderer()
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @renderer.setClearColorHex(0x444444, 1)
    @renderer.autoClear = false
    @el.appendChild(@renderer.domElement)

    @on 'render', -> @renderer.clear()

  render: =>
    @trigger('beforeRender')
    @trigger('render')
    @trigger('afterRender')
    requestAnimationFrame(@render)
