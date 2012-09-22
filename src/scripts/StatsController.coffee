class D.StatsController extends Backbone.View
  constructor: ->
    super
    @renderController = @options.renderController
    @stats = new Stats()
    @el.appendChild(@stats.domElement)
    @renderController.on('afterRender', @stats.update, @stats)
