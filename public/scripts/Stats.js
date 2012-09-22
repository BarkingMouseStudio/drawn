(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.Stats = (function(_super) {

    __extends(Stats, _super);

    function Stats() {
      Stats.__super__.constructor.apply(this, arguments);
      this.renderer = this.options.renderer;
      this.stats = new Stats();
      this.el.appendChild(this.stats.domElement);
      this.renderer.on('afterRender', this.stats.update);
    }

    return Stats;

  })(Backbone.View);

}).call(this);
