(function() {
  var Particle3D, animate, bind, composer, drag, gravity, half_height, half_width, height, init_background, init_camera, init_composer, init_foreground, init_geometry, init_lights, init_particle, init_particles, init_renderer, init_scene, init_stats, loadGeometry, mouseX, mouseXOnMouseDown, mouse_down, particle_bounds, particle_system, random, random_int, renderer, shape, stats, targetRotation, targetRotationOnMouseDown, update_particles, width,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  document.onselectstart = function() {
    return false;
  };

  mouse_down = false;

  targetRotation = 0;

  targetRotationOnMouseDown = 0;

  mouseX = 0;

  mouseXOnMouseDown = 0;

  document.addEventListener('mousedown', function(e) {
    e.preventDefault();
    mouse_down = true;
    mouseXOnMouseDown = event.clientX - half_width;
    return targetRotationOnMouseDown = targetRotation;
  }, false);

  document.addEventListener('mousemove', function(e) {
    if (!mouse_down) {
      return;
    }
    mouseX = event.clientX - half_width;
    return targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
  }, false);

  document.addEventListener('mouseup', function(e) {
    e.preventDefault();
    return mouse_down = false;
  }, false);

  shape = null;

  particle_bounds = 500;

  gravity = new THREE.Vector3(0, -9.8, 0);

  drag = 0.00015;

  Particle3D = (function(_super) {

    __extends(Particle3D, _super);

    function Particle3D() {
      this.mass = random(0, 1);
      this.set(random(-particle_bounds, particle_bounds), random(-particle_bounds, particle_bounds), random(-particle_bounds, particle_bounds));
      this.acceleration = new THREE.Vector3(0, 0, 0);
      this.velocity = new THREE.Vector3(random(), random(), random());
    }

    Particle3D.prototype.update = function() {
      if (this.x < -particle_bounds) {
        this.x = particle_bounds;
      } else if (this.x > particle_bounds) {
        this.x = -particle_bounds;
      }
      if (this.y < -particle_bounds) {
        this.y = particle_bounds;
      } else if (this.y > particle_bounds) {
        this.y = -particle_bounds;
      }
      if (this.z < -particle_bounds) {
        this.z = particle_bounds;
      } else if (this.z > particle_bounds) {
        this.z = -particle_bounds;
      }
      this.acceleration.multiplyScalar(0);
      this.acceleration.addSelf(gravity);
      this.acceleration.multiplyScalar(this.mass);
      this.acceleration.multiplyScalar(drag);
      this.velocity.addSelf(this.acceleration);
      return this.addSelf(this.velocity);
    };

    return Particle3D;

  })(THREE.Vector3);

  random = function(min, max) {
    if (min == null) {
      min = -1;
    }
    if (max == null) {
      max = 1;
    }
    return Math.random() * (max - min) + min;
  };

  random_int = function(min, max) {
    return Math.floor(random(min, max));
  };

  bind = function(val, fn) {
    return fn(val);
  };

  width = window.innerWidth;

  height = window.innerHeight;

  half_width = width / 2;

  half_height = height / 2;

  particle_system = null;

  init_particle = function(particle) {
    var ax, ay, az, px, py, pz, vx, vy, vz, _ref, _ref1, _ref2;
    _ref = [random(-particle_bounds, particle_bounds), random(-particle_bounds, particle_bounds), random(-particle_bounds, particle_bounds)], px = _ref[0], py = _ref[1], pz = _ref[2];
    _ref1 = [0, 0, 0], ax = _ref1[0], ay = _ref1[1], az = _ref1[2];
    _ref2 = [random(), random(), random()], vx = _ref2[0], vy = _ref2[1], vz = _ref2[2];
    particle.set(px, py, pz);
    particle.acceleration.set(ax, ay, az);
    particle.velocity.set(vx, vy, vz);
    particle.mass = random(0, 1);
    return particle;
  };

  init_particles = function(scene) {
    var i, material, particle_count, particles, _i;
    particle_count = 100;
    particles = new THREE.Geometry();
    material = new THREE.ParticleBasicMaterial({
      color: 0x000000,
      size: 20,
      map: THREE.ImageUtils.loadTexture('../images/ash.png'),
      blending: THREE.NormalBlending,
      transparent: true
    });
    for (i = _i = 0; 0 <= particle_count ? _i <= particle_count : _i >= particle_count; i = 0 <= particle_count ? ++_i : --_i) {
      particles.vertices.push(new Particle3D());
    }
    particle_system = new THREE.ParticleSystem(particles, material);
    particle_system.dynamic = true;
    particle_system.sortParticles = true;
    scene.add(particle_system);
    return particle_system;
  };

  loadGeometry = function(url) {
    var deferred, loader;
    deferred = new Deferred();
    loader = new THREE.GeometryLoader();
    loader.addEventListener('error', function(event) {
      return deferred.reject(new Error(event.message));
    });
    loader.addEventListener('load', function(event) {
      return deferred.resolve(event.content);
    });
    loader.load(url);
    return deferred.promise();
  };

  update_particles = function() {
    var p_count, particle_system_geometry, particles;
    particle_system_geometry = particle_system.geometry;
    particles = particle_system_geometry.vertices;
    p_count = particles.length;
    while (p_count--) {
      particles[p_count].update();
    }
    return particle_system_geometry.verticesNeedUpdate = true;
  };

  init_stats = function() {
    var stats;
    stats = new Stats();
    document.body.appendChild(stats.domElement);
    return stats;
  };

  init_camera = function(width, height) {
    var aspect_ratio, camera, far, near, view_angle;
    view_angle = 45;
    aspect_ratio = width / height;
    near = 1;
    far = 10000;
    camera = new THREE.PerspectiveCamera(view_angle, aspect_ratio, near, far);
    camera.position.z = 300;
    return camera;
  };

  init_lights = function(scene) {
    var ambient_light, point_light;
    ambient_light = new THREE.AmbientLight(0x222222);
    scene.add(ambient_light);
    point_light = new THREE.PointLight(0xffffff, 1, 500);
    point_light.position.set(250, 250, 250);
    return scene.add(point_light);
  };

  init_scene = function() {
    var scene;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.002);
    return scene;
  };

  init_geometry = function(scene) {
    var material;
    material = new THREE.MeshLambertMaterial({
      color: 0x888888
    });
    return loadGeometry('../models/sleeping_woman.js').pipe(function(geometry) {
      var mesh;
      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(5, 5, 5);
      scene.add(mesh);
      return mesh;
    });
  };

  init_renderer = function(width, height) {
    var renderer;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColorHex(0x000000, 1);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    return renderer;
  };

  init_background = function() {
    var camera, material, mesh, scene;
    camera = new THREE.OrthographicCamera(-half_width, half_width, half_height, -half_height, -10000, 10000);
    camera.position.z = 100;
    material = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('../images/vitruvian.jpg'),
      depthTest: false
    });
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.z = -500;
    mesh.scale.set(2000 * (1385 / 2001), 2000, 1);
    scene = new THREE.Scene();
    scene.add(mesh);
    return [scene, camera];
  };

  init_foreground = function() {
    var camera, scene;
    camera = init_camera(width, height);
    scene = init_scene();
    init_lights(scene);
    init_geometry(scene).done(function(mesh) {
      return shape = mesh;
    });
    particle_system = init_particles(scene);
    return [scene, camera];
  };

  init_composer = function(renderer) {
    var background_pass, background_scene, composer, foreground_pass, foreground_scene, ortographic_camera, parameters, perspective_camera, render_target, screen_pass, _ref, _ref1;
    render_target = new THREE.WebGLRenderTarget(width, height, parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    });
    composer = new THREE.EffectComposer(renderer, render_target);
    _ref = init_background(), background_scene = _ref[0], ortographic_camera = _ref[1];
    _ref1 = init_foreground(), foreground_scene = _ref1[0], perspective_camera = _ref1[1];
    background_pass = new THREE.RenderPass(background_scene, ortographic_camera);
    foreground_pass = new THREE.RenderPass(foreground_scene, perspective_camera);
    foreground_pass.clear = false;
    screen_pass = new THREE.ShaderPass(THREE.ShaderExtras['screen']);
    screen_pass.renderToScreen = true;
    composer.addPass(background_pass);
    composer.addPass(foreground_pass);
    composer.addPass(screen_pass);
    return composer;
  };

  stats = init_stats();

  renderer = init_renderer(width, height);

  composer = init_composer(renderer);

  animate = function() {
    requestAnimationFrame(animate);
    update_particles();
    if (shape) {
      shape.rotation.y += (targetRotation - shape.rotation.y) * 0.05;
    }
    renderer.clear();
    composer.render(0.1);
    return stats.update();
  };

  animate();

}).call(this);
