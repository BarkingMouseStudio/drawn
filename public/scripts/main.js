(function() {
  var effectController, renderController, statsController;

  renderController = new D.RenderController({
    el: document.body
  });

  statsController = new D.StatsController({
    renderController: renderController,
    el: document.body
  });

  effectController = new D.EffectController({
    renderController: renderController,
    el: document.body
  });

  renderController.render();

}).call(this);
