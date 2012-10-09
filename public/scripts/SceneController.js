(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.SceneController = (function(_super) {

    __extends(SceneController, _super);

    function SceneController() {
      var ambientLight, aspectRatio, camera, foregroundPass, height, parameters, pointLight, renderTarget, scene, screenPass, viewAngle, width,
        _this = this;
      SceneController.__super__.constructor.apply(this, arguments);
      this.renderController = this.options.renderController;
      width = window.innerWidth;
      height = window.innerHeight;
      viewAngle = 10;
      aspectRatio = width / height;
      camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000);
      camera.position.z = 365;
      this.controls = new THREE.TrackballControls(camera);
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x222222, 0.002);
      ambientLight = new THREE.AmbientLight(0x222222);
      scene.add(ambientLight);
      pointLight = new THREE.PointLight(0xffffff, 1, 500);
      pointLight.position.set(250, 250, 250);
      scene.add(pointLight);
      D.loadGeometry('models/ducky.js').done(function(geometry) {
        var material, mesh, scale;
        material = new THREE.MeshNormalMaterial({
          shading: THREE.SmoothShading
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(scale = 10, scale, scale);
        mesh.rotation.set(0, Math.PI / 2, 0);
        return scene.add(mesh);
      });
      parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
      };
      renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
      this.composer = new THREE.EffectComposer(this.renderController.renderer, renderTarget);
      foregroundPass = new THREE.RenderPass(scene, camera);
      screenPass = new THREE.ShaderPass(THREE.ShaderExtras.screen);
      screenPass.renderToScreen = true;
      this.composer.addPass(foregroundPass);
      this.composer.addPass(screenPass);
    }

    SceneController.prototype.render = function() {
      this.controls.update();
      return this.composer.render();
    };

    return SceneController;

  })(Backbone.View);

}).call(this);
