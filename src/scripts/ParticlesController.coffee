class D.ParticlesController extends Backbone.View
  constructor: ->
    super

    @renderController = @options.renderController
    # @renderController.on 'beforeRender', =>
    # @update()