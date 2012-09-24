(function() {
  var effectController, particlesController, renderController, statsController;

  renderController = new D.RenderController({
    el: document.body
  });

  particlesController = new D.ParticlesController({
    renderController: renderController,
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
