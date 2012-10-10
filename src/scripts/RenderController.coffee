class D.RenderController extends Backbone.View
  constructor: ->
    super
    @renderer = new THREE.WebGLRenderer()
    @renderer.setSize(window.innerWidth, window.innerHeight)
    @renderer.setClearColorHex(0x444444, 1)
    @renderer.autoClear = false

    @el.appendChild(@renderer.domElement)

    $(window).on('resize', @onResized)

    @statsController = new D.StatsController({
      renderController: this,
      el: document.body
    })
    @effectController = new D.SceneController({
      renderController: this,
      el: document.body
    })

  onResized: =>
    @renderer.setSize(window.innerWidth, window.innerHeight)

  render: =>
    @renderer.clear()
    @effectController.render()
    @statsController.update()

    requestAnimationFrame(@render)
