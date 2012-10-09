(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.ParticlesController = (function(_super) {

    __extends(ParticlesController, _super);

    function ParticlesController() {
      this.render = __bind(this.render, this);

      var material, particle, particleCount, particles;
      ParticlesController.__super__.constructor.apply(this, arguments);
      this.scene = this.options.scene;
      this.renderController = this.options.renderController;
      particleCount = 100;
      particles = new THREE.Geometry();
      material = new THREE.ParticleBasicMaterial({
        color: 0x000000,
        size: 20,
        map: THREE.ImageUtils.loadTexture('../images/ash.png'),
        blending: THREE.NormalBlending,
        transparent: true
      });
      while (particleCount--) {
        particle = new D.Particle3D();
        particles.vertices.push(particle);
      }
      this.particleSystem = new THREE.ParticleSystem(particles, material);
      this.particleSystem.dynamic = true;
      this.particleSystem.sortParticles = true;
      this.scene.add(this.particleSystem);
    }

    ParticlesController.prototype.render = function() {
      var particle, particleCount, particleSystemGeometry, particles;
      particleSystemGeometry = this.particleSystem.geometry;
      particles = particleSystemGeometry.vertices;
      particleCount = particles.length;
      while (particleCount--) {
        particle = particles[particleCount];
        particle.update();
      }
      return particleSystemGeometry.verticesNeedUpdate = true;
    };

    return ParticlesController;

  })(Backbone.View);

}).call(this);
