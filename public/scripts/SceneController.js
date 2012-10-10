(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  D.SceneController = (function(_super) {

    __extends(SceneController, _super);

    function SceneController() {
      var ambientLight, aspectRatio, domElement, foregroundPass, parameters, pointLight, renderTarget, screenPass, viewAngle,
        _this = this;
      SceneController.__super__.constructor.apply(this, arguments);
      this.renderController = this.options.renderController;
      domElement = this.renderController.renderer.domElement;
      viewAngle = 10;
      aspectRatio = window.innerWidth / window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000);
      this.camera.position.z = 365;
      this.interactionController = new D.InteractionController({
        camera: this.camera,
        el: domElement
      });
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x222222, 0.002);
      ambientLight = new THREE.AmbientLight(0x222222);
      this.scene.add(ambientLight);
      pointLight = new THREE.PointLight(0xffffff, 1, 500);
      pointLight.position.set(250, 250, 250);
      this.scene.add(pointLight);
      $.when([D.loadGeometry('models/ducky_0.js'), D.loadGeometry('models/ducky_1.js'), D.loadGeometry('models/ducky_2.js'), D.loadGeometry('models/ducky_3.js'), D.loadGeometry('models/ducky_4.js'), D.loadGeometry('models/ducky_5.js')]).done(function() {
        var geometries, group;
        geometries = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        group = new THREE.Object3D();
        _.each(geometries, function(geometry) {
          var material, mesh, scale;
          material = new THREE.MeshNormalMaterial({
            shading: THREE.SmoothShading,
            opacity: 0.8
          });
          mesh = new THREE.Mesh(geometry, material);
          mesh.scale.set(scale = 10, scale, scale);
          mesh.rotation.set(0, Math.PI / 2, 0);
          return group.add(mesh);
        });
        _this.interactionController.setObject(group);
        return _this.scene.add(group);
      });
      parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
      };
      renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);
      this.composer = new THREE.EffectComposer(this.renderController.renderer, renderTarget);
      foregroundPass = new THREE.RenderPass(this.scene, this.camera);
      screenPass = new THREE.ShaderPass(THREE.ShaderExtras.screen);
      screenPass.renderToScreen = true;
      this.composer.addPass(foregroundPass);
      this.composer.addPass(screenPass);
    }

    SceneController.prototype.render = function() {
      this.interactionController.update();
      return this.composer.render();
    };

    return SceneController;

  })(Backbone.View);

}).call(this);
