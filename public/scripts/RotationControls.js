(function() {
  var halfHeight, halfWidth, height, width,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  width = window.innerWidth;

  height = window.innerHeight;

  halfWidth = width / 2;

  halfHeight = height / 2;

  D.RotationControls = (function() {

    RotationControls.prototype.isMouseDown = false;

    RotationControls.prototype.mouseX = 0;

    RotationControls.prototype.mouseY = 0;

    RotationControls.prototype.initMouseX = 0;

    RotationControls.prototype.initMouseY = 0;

    function RotationControls(object, el) {
      this.object = object;
      this.el = el != null ? el : document;
      this.onMouseUp = __bind(this.onMouseUp, this);

      this.onMouseMove = __bind(this.onMouseMove, this);

      this.onMouseDown = __bind(this.onMouseDown, this);

      this.object.rotationAcceleration = new THREE.Vector3();
      this.object.rotationVelocity = new THREE.Vector3();
      this.el.addEventListener('mousedown', this.onMouseDown, false);
      this.el.addEventListener('mousemove', this.onMouseMove, false);
      this.el.addEventListener('mouseup', this.onMouseUp, false);
    }

    RotationControls.prototype.onMouseDown = function(e) {
      e.preventDefault();
      this.isMouseDown = true;
      this.initMouseX = e.clientX - halfWidth;
      return this.initMouseY = e.clientY - halfHeight;
    };

    RotationControls.prototype.onMouseMove = function(e) {
      if (!this.isMouseDown) {
        return;
      }
      this.mouseX = e.clientX - halfWidth;
      this.mouseY = e.clientY - halfHeight;
      this.mouseDX = this.mouseX - this.initMouseX;
      this.mouseDY = this.mouseY - this.initMouseY;
      this.mouseDXScaled = (this.mouseDX / width) * Math.PI;
      this.mouseDYScaled = (this.mouseDY / height) * Math.PI;
      this.object.rotationAcceleration.addSelf(new THREE.Vector3(this.mouseDYScaled, this.mouseDXScaled, 0));
      this.initMouseX = this.mouseX;
      return this.initMouseY = this.mouseY;
    };

    RotationControls.prototype.onMouseUp = function(e) {
      e.preventDefault();
      return this.isMouseDown = false;
    };

    RotationControls.prototype.update = function() {
      var drag, pX, pY, scale, solutionThreshold, x, y, _ref;
      this.object.rotationAcceleration.multiplyScalar(scale = 0.5);
      this.object.rotationVelocity.addSelf(this.object.rotationAcceleration);
      this.object.rotation.addSelf(this.object.rotationVelocity);
      this.object.rotationVelocity.multiplyScalar(drag = 0.9);
      _ref = this.object.rotation, x = _ref.x, y = _ref.y;
      if (x > D.TWO_PI || x < -D.TWO_PI) {
        this.object.rotation.x = x = 0;
      }
      if (y > D.TWO_PI || y < -D.TWO_PI) {
        this.object.rotation.y = y = 0;
      }
      solutionThreshold = 5;
      pX = (Math.abs(x) / Math.PI) * 100;
      pY = (Math.abs(y) / Math.PI) * 100;
      if (pX + pY < solutionThreshold) {
        return console.warn('SOLUTION', pX, pY);
      }
      /*
          if @rotationX > twoPI
            @rotationX -= twoPI
          else if @rotationX < -twoPI
            @rotationX += twoPI
      
          if @rotationY > twoPI
            @rotationY -= twoPI
          else if @rotationY < -twoPI
            @rotationY += twoPI
      */

    };

    return RotationControls;

  })();

}).call(this);
