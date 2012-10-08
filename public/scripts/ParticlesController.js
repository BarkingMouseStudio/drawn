(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.ParticlesController = (function(_super) {

    __extends(ParticlesController, _super);

    function ParticlesController() {
      var material, particle, particleCount, particleSystem, particles,
        _this = this;
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
      particleSystem = new THREE.ParticleSystem(particles, material);
      particleSystem.dynamic = true;
      particleSystem.sortParticles = true;
      this.scene.add(particleSystem);
      this.renderController.on('beforeRender', function() {
        var particleSystemGeometry;
        particleSystemGeometry = particleSystem.geometry;
        particles = particleSystemGeometry.vertices;
        particleCount = particles.length;
        while (particleCount--) {
          particle = particles[particleCount];
          particle.update();
        }
        return particleSystemGeometry.verticesNeedUpdate = true;
      });
    }

    return ParticlesController;

  })(Backbone.View);

}).call(this);
