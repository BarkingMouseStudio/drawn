(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  D.RotationControls = (function() {

    RotationControls.prototype.isMouseDown = false;

    RotationControls.prototype.deceleration = 0.05;

    RotationControls.prototype.scale = 0.02;

    RotationControls.prototype.initialRotationX = 0;

    RotationControls.prototype.initialRotationY = 0;

    RotationControls.prototype.mouseX = 0;

    RotationControls.prototype.mouseY = 0;

    RotationControls.prototype.initialMouseX = 0;

    RotationControls.prototype.initialMouseY = 0;

    RotationControls.prototype.rotationX = 0;

    RotationControls.prototype.rotationY = 0;

    function RotationControls(object, el) {
      this.object = object;
      this.el = el != null ? el : document;
      this.onMouseUp = __bind(this.onMouseUp, this);

      this.onMouseMove = __bind(this.onMouseMove, this);

      this.onMouseDown = __bind(this.onMouseDown, this);

      this.halfWidth = window.innerWidth / 2;
      this.halfHeight = window.innerHeight / 2;
      this.el.addEventListener('mousedown', this.onMouseDown, false);
      this.el.addEventListener('mousemove', this.onMouseMove, false);
      this.el.addEventListener('mouseup', this.onMouseUp, false);
    }

    RotationControls.prototype.onMouseDown = function(e) {
      e.preventDefault();
      this.isMouseDown = true;
      this.initialMouseX = e.clientX - this.halfWidth;
      this.initialMouseY = e.clientY - this.halfHeight;
      this.initialRotationX = this.rotationX;
      return this.initialRotationY = this.rotationY;
    };

    RotationControls.prototype.onMouseMove = function(e) {
      if (!this.isMouseDown) {
        return;
      }
      this.mouseX = e.clientX - this.halfWidth;
      this.mouseY = e.clientY - this.halfWidth;
      this.rotationX = this.initialRotationX + (this.mouseX - this.initialMouseX) * this.scale;
      return this.rotationY = this.initialRotationY + (this.mouseY - this.initialMouseY) * this.scale;
    };

    RotationControls.prototype.onMouseUp = function(e) {
      e.preventDefault();
      return this.isMouseDown = false;
    };

    RotationControls.prototype.update = function() {
      this.object.rotation.x += (this.rotationY - this.object.rotation.x) * this.deceleration;
      return this.object.rotation.y += (this.rotationX - this.object.rotation.y) * this.deceleration;
    };

    return RotationControls;

  })();

}).call(this);
