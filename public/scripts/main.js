(function() {
  var effectComposer, halfHeight, halfWidth, height, initBackground, initCamera, initComposer, initDeferredMesh, initForeground, initLights, initParticles, initRenderer, initStats, particleSystem, renderer, rotationControls, stats, update, updateParticles, width;

  document.onselectstart = function() {
    return false;
  };

  width = window.innerWidth;

  height = window.innerHeight;

  halfWidth = width / 2;

  halfHeight = height / 2;

  initParticles = function(scene) {
    var i, material, particleCount, particleSystem, particles, _i;
    particleCount = 100;
    particles = new THREE.Geometry();
    material = new THREE.ParticleBasicMaterial({
      color: 0x000000,
      size: 20,
      map: THREE.ImageUtils.loadTexture('../images/ash.png'),
      blending: THREE.NormalBlending,
      transparent: true
    });
    for (i = _i = 0; 0 <= particleCount ? _i <= particleCount : _i >= particleCount; i = 0 <= particleCount ? ++_i : --_i) {
      particles.vertices.push(new D.Particle3D());
    }
    particleSystem = new THREE.ParticleSystem(particles, material);
    particleSystem.dynamic = true;
    particleSystem.sortParticles = true;
    scene.add(particleSystem);
    return particleSystem;
  };

  updateParticles = function() {
    var particleCount, particleSystemGeometry, particles;
    particleSystemGeometry = particleSystem.geometry;
    particles = particleSystemGeometry.vertices;
    particleCount = particles.length;
    while (particleCount--) {
      particles[particleCount].update();
    }
    return particleSystemGeometry.verticesNeedUpdate = true;
  };

  initStats = function() {
    var stats;
    stats = new Stats();
    document.body.appendChild(stats.domElement);
    return stats;
  };

  initCamera = function(width, height) {
    var aspectRatio, camera, viewAngle;
    viewAngle = 10;
    aspectRatio = width / height;
    camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000);
    camera.position.z = 365;
    return camera;
  };

  initLights = function(scene) {
    var ambientLight, pointLight;
    ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(0xffffff, 1, 500);
    pointLight.position.set(250, 250, 250);
    return scene.add(pointLight);
  };

  initRenderer = function(width, height) {
    var renderer;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColorHex(0x000000, 1);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    return renderer;
  };

  initBackground = function() {
    var aspectRatio, camera, material, mesh, scene, size;
    camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, -10000, 10000);
    camera.position.z = 100;
    material = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('images/sleeping_woman.png'),
      depthTest: false
    });
    size = 482;
    aspectRatio = 1230 / 1510;
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.position.y = 45;
    mesh.position.z = -1000;
    mesh.scale.set(size * aspectRatio, size, 1);
    scene = new THREE.Scene();
    scene.add(mesh);
    return [scene, camera];
  };

  rotationControls = null;

  particleSystem = null;

  initDeferredMesh = function(scene) {
    return D.loadGeometry('models/sleeping_woman_extruded.js').pipe(function(geometry) {
      var material, mesh;
      material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      rotationControls = new D.RotationControls(mesh);
      return mesh;
    });
  };

  initForeground = function() {
    var camera, scene;
    camera = initCamera(width, height);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.002);
    initLights(scene);
    initDeferredMesh(scene);
    particleSystem = initParticles(scene);
    return [scene, camera];
  };

  initComposer = function(renderer) {
    var backgroundPass, backgroundScene, effectComposer, foregroundPass, foregroundScene, ortographicCamera, parameters, perspectiveCamera, renderTarget, screenPass, _ref, _ref1;
    renderTarget = new THREE.WebGLRenderTarget(width, height, parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false
    });
    effectComposer = new THREE.EffectComposer(renderer, renderTarget);
    _ref = initBackground(), backgroundScene = _ref[0], ortographicCamera = _ref[1];
    _ref1 = initForeground(), foregroundScene = _ref1[0], perspectiveCamera = _ref1[1];
    backgroundPass = new THREE.RenderPass(backgroundScene, ortographicCamera);
    foregroundPass = new THREE.RenderPass(foregroundScene, perspectiveCamera);
    foregroundPass.clear = false;
    screenPass = new THREE.ShaderPass(THREE.ShaderExtras['screen']);
    screenPass.renderToScreen = true;
    effectComposer.addPass(backgroundPass);
    effectComposer.addPass(foregroundPass);
    effectComposer.addPass(screenPass);
    return effectComposer;
  };

  stats = initStats();

  renderer = initRenderer(width, height);

  effectComposer = initComposer(renderer);

  update = function() {
    requestAnimationFrame(update);
    updateParticles();
    if (rotationControls != null) {
      rotationControls.update();
    }
    renderer.clear();
    effectComposer.render(0.1);
    return stats.update();
  };

  update();

}).call(this);
