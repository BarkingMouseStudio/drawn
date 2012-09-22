(function() {
  var halfHeight, halfWidth, height, width,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  width = window.innerWidth;

  height = window.innerHeight;

  halfWidth = width / 2;

  halfHeight = height / 2;

  D.RotationController = (function(_super) {

    __extends(RotationController, _super);

    RotationController.prototype.isMouseDown = false;

    RotationController.prototype.scale = 0.5;

    RotationController.prototype.drag = 0.9;

    RotationController.prototype.disabled = false;

    RotationController.prototype.maxSpeed = 0.2;

    RotationController.prototype.solutionThreshold = 2;

    RotationController.prototype.mouseX = 0;

    RotationController.prototype.mouseY = 0;

    RotationController.prototype.initMouseX = 0;

    RotationController.prototype.initMouseY = 0;

    RotationController.prototype.events = {
      'mousedown': 'onMouseDown',
      'mousemove': 'onMouseMove',
      'mouseup': 'onMouseUp'
    };

    function RotationController() {
      var _this = this;
      RotationController.__super__.constructor.apply(this, arguments);
      this.object = this.options.object;
      this.renderController = this.options.renderController;
      this.renderController.on('beforeRender', function() {
        return _this.update();
      });
      this.rotationAcceleration = new THREE.Vector3();
      this.rotationVelocity = new THREE.Vector3();
    }

    RotationController.prototype.onMouseDown = function(e) {
      e.preventDefault();
      this.isMouseDown = true;
      this.initMouseX = e.clientX - halfWidth;
      return this.initMouseY = e.clientY - halfHeight;
    };

    RotationController.prototype.onMouseMove = function(e) {
      if (!this.isMouseDown) {
        return;
      }
      this.mouseX = e.clientX - halfWidth;
      this.mouseY = e.clientY - halfHeight;
      this.mouseDX = this.mouseX - this.initMouseX;
      this.mouseDY = this.mouseY - this.initMouseY;
      this.mouseDXScaled = (this.mouseDX / width) * Math.PI;
      this.mouseDYScaled = (this.mouseDY / height) * Math.PI;
      this.rotationAcceleration.addSelf(new THREE.Vector3(this.mouseDYScaled, this.mouseDXScaled, 0));
      this.initMouseX = this.mouseX;
      return this.initMouseY = this.mouseY;
    };

    RotationController.prototype.onMouseUp = function(e) {
      e.preventDefault();
      return this.isMouseDown = false;
    };

    RotationController.prototype.update = function() {
      var accuracy, speed, tooFast, x, y, _ref;
      if (this.disabled) {
        return;
      }
      this.rotationAcceleration.multiplyScalar(this.scale);
      this.rotationVelocity.addSelf(this.rotationAcceleration);
      this.object.rotation.addSelf(this.rotationVelocity);
      this.rotationVelocity.multiplyScalar(this.drag);
      _ref = this.object.rotation, x = _ref.x, y = _ref.y;
      if (x > D.TWO_PI) {
        this.object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI;
      } else if (x < -D.TWO_PI) {
        this.object.rotation.x -= (x / D.TWO_PI) * D.TWO_PI;
      }
      if (y > D.TWO_PI) {
        this.object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI;
      } else if (y < -D.TWO_PI) {
        this.object.rotation.y -= (y / D.TWO_PI) * D.TWO_PI;
      }
      speed = this.rotationVelocity.lengthSq();
      tooFast = speed > this.maxSpeed;
      accuracy = (this.object.rotation.length() / D.TWO_PI) * 100;
      if (tooFast) {
        return this.rotationAcceleration.addSelf(this.rotationVelocity.clone().negate());
      } else if (accuracy < this.solutionThreshold) {
        console.warn('SOLUTION', accuracy, speed);
        this.object.rotation.set(0, 0, 0);
        return this.disabled = true;
      }
    };

    return RotationController;

  })(Backbone.View);

}).call(this);
