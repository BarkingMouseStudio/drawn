(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.Particle3D = (function(_super) {

    __extends(Particle3D, _super);

    Particle3D.drag = 0.00015;

    Particle3D.gravity = new THREE.Vector3(0, -9.8, 0);

    Particle3D.prototype.age = 0;

    Particle3D.prototype.lifespan = 100;

    Particle3D.prototype.mass = 1;

    function Particle3D() {
      this.acceleration = new THREE.Vector3(0, 0, 0);
      this.velocity = new THREE.Vector3(0, 0, 0);
    }

    Particle3D.prototype.update = function() {
      this.acceleration.multiplyScalar(0);
      this.acceleration.addSelf(D.Particle3D.gravity);
      this.acceleration.multiplyScalar(this.mass);
      this.acceleration.multiplyScalar(0);
      this.velocity.addSelf(this.acceleration);
      this.velocity.multiplyScalar(D.Particle3D.drag);
      return this.addSelf(this.velocity);
    };

    return Particle3D;

  })(THREE.Vector3);

}).call(this);
