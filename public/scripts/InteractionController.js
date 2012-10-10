(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.InteractionController = (function(_super) {

    __extends(InteractionController, _super);

    InteractionController.prototype.mouseDown = false;

    InteractionController.prototype.deceleration = 0.15;

    InteractionController.prototype.drag = 0.9;

    function InteractionController(options) {
      var _ref;
      this.options = options;
      this.update = __bind(this.update, this);

      this.onMouseMove = __bind(this.onMouseMove, this);

      this.onMouseUp = __bind(this.onMouseUp, this);

      this.onMouseDown = __bind(this.onMouseDown, this);

      this.setObject = __bind(this.setObject, this);

      _ref = this.options, this.camera = _ref.camera, this.el = _ref.el;
      this.el.addEventListener('mousedown', this.onMouseDown);
      this.el.addEventListener('mousemove', this.onMouseMove);
      this.el.addEventListener('mouseup', this.onMouseUp);
      this.initMouse = new THREE.Vector3(0, 0, 0.5);
      this.mouse = new THREE.Vector3(0, 0, 0.5);
      this.projector = new THREE.Projector();
      this.rotationalVelocity = new THREE.Vector3();
      this.rotationalAcceleration = new THREE.Vector3();
    }

    InteractionController.prototype.setObject = function(object) {
      this.object = object;
    };

    InteractionController.prototype.onMouseDown = function(e) {
      var intersects, mouse, nearest, ray, _ref;
      this.mouseDown = true;
      this.initMouse.x = this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.initMouse.y = this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (!((_ref = this.object) != null ? _ref.children.length : void 0)) {
        return;
      }
      mouse = this.initMouse.clone();
      this.projector.unprojectVector(mouse, this.camera);
      ray = new THREE.Ray(this.camera.position, mouse.subSelf(this.camera.position).normalize());
      intersects = ray.intersectObjects(this.object.children);
      nearest = intersects[0];
      _.each(this.object.children, function(object) {
        object.material.opacity = 0.8;
        return object.material.needsUpdate = true;
      });
      this.activeObject = nearest != null ? nearest.object : void 0;
      if (this.activeObject) {
        this.activeObject.material.opacity = 1.0;
        return this.activeObject.material.needsUpdate = true;
      }
    };

    InteractionController.prototype.onMouseUp = function(e) {
      return this.mouseDown = false;
    };

    InteractionController.prototype.onMouseMove = function(e) {
      var mouseDiff;
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (!this.mouseDown) {
        return;
      }
      this.dragging = true;
      mouseDiff = this.mouse.clone().subSelf(this.initMouse).multiplyScalar(Math.PI);
      this.rotationalAcceleration.addSelf(new THREE.Vector3(-mouseDiff.y, mouseDiff.x, 0));
      this.initMouse.x = this.mouse.x;
      return this.initMouse.y = this.mouse.y;
    };

    InteractionController.prototype.update = function() {
      if (!this.object) {
        return;
      }
      this.rotationalAcceleration.multiplyScalar(this.deceleration);
      this.rotationalVelocity.addSelf(this.rotationalAcceleration);
      if (this.activeObject != null) {
        this.activeObject.rotation.addSelf(this.rotationalVelocity);
      } else {
        this.object.rotation.addSelf(this.rotationalVelocity);
      }
      return this.rotationalVelocity.multiplyScalar(this.drag);
    };

    return InteractionController;

  })(Backbone.View);

}).call(this);
