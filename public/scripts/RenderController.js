(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.RenderController = (function(_super) {

    __extends(RenderController, _super);

    function RenderController() {
      this.render = __bind(this.render, this);
      RenderController.__super__.constructor.apply(this, arguments);
      this.renderer = new THREE.WebGLRenderer({
        precision: 'highp',
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColorHex(0x444444, 1);
      this.renderer.autoClear = false;
      this.el.appendChild(this.renderer.domElement);
      this.statsController = new D.StatsController({
        renderController: this,
        el: document.body
      });
      this.sceneController = new D.SceneController({
        renderController: this,
        el: document.body
      });
    }

    RenderController.prototype.render = function() {
      this.renderer.clear();
      this.sceneController.render();
      this.statsController.update();
      return requestAnimationFrame(this.render);
    };

    return RenderController;

  })(Backbone.View);

}).call(this);
