(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.InteractionController = (function(_super) {

    __extends(InteractionController, _super);

    InteractionController.prototype.mouseDown = false;

    InteractionController.prototype.deceleration = 0.2;

    InteractionController.prototype.drag = 0.9;

    function InteractionController(options) {
      this.options = options;
      this.update = __bind(this.update, this);

      this.onMouseMove = __bind(this.onMouseMove, this);

      this.onMouseDown = __bind(this.onMouseDown, this);

      this.onMouseUp = __bind(this.onMouseUp, this);

      this.updateMouseVector = __bind(this.updateMouseVector, this);

      this.setObject = __bind(this.setObject, this);

      InteractionController.__super__.constructor.apply(this, arguments);
      this.camera = this.options.camera;
      this.$el.on('mousedown', this.onMouseDown);
      this.$el.on('mousemove', this.onMouseMove);
      this.$el.on('mouseup', this.onMouseUp);
      this.initMouse = new THREE.Vector3(0, 0, 1);
      this.mouse = new THREE.Vector3(0, 0, 1);
      this.projector = new THREE.Projector();
      this.rotationalVelocity = new THREE.Vector3();
      this.rotationalAcceleration = new THREE.Vector3();
    }

    InteractionController.prototype.setObject = function(object) {
      this.object = object;
    };

    InteractionController.prototype.projectMouse = function(objects) {
      var intersects, mouse, ray;
      mouse = this.initMouse.clone();
      this.projector.unprojectVector(mouse, this.camera);
      ray = new THREE.Ray(this.camera.position, mouse.subSelf(this.camera.position).normalize());
      intersects = ray.intersectObjects(objects);
      return intersects[0];
    };

    InteractionController.prototype.updateMouseVector = function(mouse, e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      return mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    InteractionController.prototype.onMouseUp = function(e) {
      this.mouseDown = false;
      this.partialObject = null;
      this.activeNormal = null;
      return this.mouseDirection = null;
    };

    InteractionController.prototype.onMouseDown = function(e) {
      var boundingCube, material, nearest;
      this.mouseDown = true;
      this.updateMouseVector(this.mouse, e);
      this.initMouse.copy(this.mouse);
      _.each(this.object.children, function(object) {
        var material;
        material = object.material;
        material.opacity = 0.8;
        return material.needsUpdate = true;
      });
      nearest = this.projectMouse(this.object.children);
      this.partialObject = nearest ? nearest.object : null;
      if (!this.partialObject) {
        return;
      }
      material = this.partialObject.material;
      material.opacity = 1.0;
      boundingCube = this.partialObject.getChildByName('boundingCube');
      nearest = this.projectMouse([boundingCube]);
      return this.activeNormal = nearest ? nearest.face.normal.clone().addSelf(this.partialObject.rotation) : null;
    };

    InteractionController.prototype.onMouseMove = function(e) {
      var mouseDirection, rotation;
      if (!(this.mouseDown && this.object)) {
        return;
      }
      this.updateMouseVector(this.mouse, e);
      mouseDirection = this.mouse.clone().subSelf(this.initMouse);
      if (!this.activeNormal) {
        rotation = new THREE.Vector3(-mouseDirection.y, mouseDirection.x, 0);
      } else {
        if (!this.mouseDirection) {
          this.mouseDirection = D.snapVector(mouseDirection.clone());
          this.mouseDirection.multiplyScalar(0.2);
        }
        rotation = new THREE.Vector3(0, this.mouseDirection.x, -this.mouseDirection.y);
      }
      this.rotationalAcceleration.addSelf(rotation);
      return this.initMouse.copy(this.mouse);
    };

    InteractionController.prototype.update = function() {
      if (!this.object) {
        return;
      }
      this.rotationalAcceleration.multiplyScalar(this.deceleration);
      this.rotationalVelocity.addSelf(this.rotationalAcceleration);
      if (this.partialObject != null) {
        this.partialObject.rotation.addSelf(this.rotationalVelocity);
      } else {
        this.object.rotation.addSelf(this.rotationalVelocity);
      }
      return this.rotationalVelocity.multiplyScalar(this.drag);
    };

    return InteractionController;

  })(Backbone.View);

}).call(this);
