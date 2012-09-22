(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.Renderer = (function(_super) {

    __extends(Renderer, _super);

    function Renderer() {
      this.render = __bind(this.render, this);
      Renderer.__super__.constructor.apply(this, arguments);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(this.el.innerWidth, this.el.innerHeight);
      this.renderer.setClearColorHex(0x444444, 1);
      this.renderer.autoClear = false;
      this.el.appendChild(this.renderer.domElement);
    }

    Renderer.prototype.render = function() {
      this.trigger('beforeRender');
      this.trigger('render');
      this.trigger('afterRender');
      return requestAnimationFrame(this.render);
    };

    return Renderer;

  })(Backbone.View);

}).call(this);
