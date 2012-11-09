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

      this.getMouseVector = __bind(this.getMouseVector, this);

      this.setObject = __bind(this.setObject, this);

      InteractionController.__super__.constructor.apply(this, arguments);
      this.camera = this.options.camera;
      this.$el.on('mousedown', this.onMouseDown);
      this.$el.on('mousemove', this.onMouseMove);
      this.$el.on('mouseup', this.onMouseUp);
      this.prevMouse = new THREE.Vector3(0, 0, 1);
      this.currentMouse = new THREE.Vector3(0, 0, 1);
      this.projector = new THREE.Projector();
      this.rotationalVelocity = new THREE.Vector3();
      this.rotationalAcceleration = new THREE.Vector3();
    }

    InteractionController.prototype.setObject = function(object) {
      this.object = object;
    };

    InteractionController.prototype.calculateIntersection = function(mouse, objects) {
      var intersects, ray;
      mouse = mouse.clone();
      this.projector.unprojectVector(mouse, this.camera);
      ray = new THREE.Ray(this.camera.position, mouse.subSelf(this.camera.position).normalize());
      intersects = ray.intersectObjects(objects);
      return intersects[0];
    };

    InteractionController.prototype.getMouseVector = function(e) {
      var mouseVector;
      mouseVector = new THREE.Vector3(0, 0, 1);
      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
      return mouseVector;
    };

    InteractionController.prototype.onMouseUp = function(e) {
      this.currentMouseDown = false;
      this.partialObject = null;
      this.activeNormal = null;
      return this.currentMouseDirection = null;
    };

    InteractionController.prototype.onMouseDown = function(e) {
      var boundingCube, material, nearestFace, nearestIntersection, nearestNormal;
      this.count = 10;
      this.currentMouseDown = true;
      this.currentMouse = this.getMouseVector(e);
      this.prevMouse.copy(this.currentMouse);
      _.each(this.object.children, function(object) {
        var material;
        material = object.material;
        material.opacity = 0.8;
        return material.needsUpdate = true;
      });
      nearestIntersection = this.calculateIntersection(this.currentMouse, this.object.children);
      this.partialObject = nearestIntersection ? nearestIntersection.object : null;
      if (!this.partialObject) {
        return;
      }
      material = this.partialObject.material;
      material.opacity = 1.0;
      boundingCube = this.partialObject.getChildByName('boundingCube');
      nearestIntersection = this.calculateIntersection(this.currentMouse, [boundingCube]);
      if (nearestIntersection) {
        nearestFace = nearestIntersection.face;
        nearestNormal = nearestFace.normal.clone().addSelf(this.partialObject.rotation);
        return this.activeNormal = nearestNormal;
      } else {
        return this.activeNormal = null;
      }
    };

    InteractionController.prototype.onMouseMove = function(e) {
      var mouseDirection;
      if (!this.currentMouseDown) {
        return;
      }
      this.currentMouse = this.getMouseVector(e);
      mouseDirection = this.currentMouse.clone().subSelf(this.prevMouse);
      this.quaternion = new THREE.Quaternion();
      this.quaternion.setFromAxisAngle(new THREE.Vector3(-mouseDirection.y, mouseDirection.x, 0), Math.PI / 2);
      return this.prevMouse.copy(this.currentMouse);
    };

    InteractionController.prototype.update = function() {
      var rotation, up;
      if (!(this.object && this.quaternion)) {
        return;
      }
      up = this.object.up.clone();
      rotation = this.quaternion.multiplyVector3(up);
      this.object.rotation = rotation;
      return this.quaternion = null;
    };

    return InteractionController;

  })(Backbone.View);

}).call(this);
