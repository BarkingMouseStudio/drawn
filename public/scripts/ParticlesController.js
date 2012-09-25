(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.ParticlesController = (function(_super) {

    __extends(ParticlesController, _super);

    function ParticlesController() {
      ParticlesController.__super__.constructor.apply(this, arguments);
      this.renderController = this.options.renderController;
    }

    return ParticlesController;

  })(Backbone.View);

}).call(this);
