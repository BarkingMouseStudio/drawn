(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.SceneController = (function(_super) {

    __extends(SceneController, _super);

    SceneController.prototype.onMouseDown = function(e) {
      var intersects, mouse, ray;
      this.mouseDown = true;
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse = this.mouse.clone();
      this.projector.unprojectVector(mouse, this.camera);
      ray = new THREE.Ray(this.camera.position, mouse.subSelf(this.camera.position).normalize());
      intersects = ray.intersectObjects(this.objects);
      return console.log(intersects);
    };

    SceneController.prototype.onMouseUp = function(e) {
      return this.mouseDown = false;
    };

    SceneController.prototype.onMouseMove = function(e) {
      if (!this.mouseDown) {
        return;
      }
      return this.dragging = true;
    };

    function SceneController() {
      this.onMouseMove = __bind(this.onMouseMove, this);

      this.onMouseUp = __bind(this.onMouseUp, this);

      this.onMouseDown = __bind(this.onMouseDown, this);

      var ambientLight, aspectRatio, domElement, foregroundPass, height, parameters, pointLight, renderTarget, screenPass, viewAngle, width,
        _this = this;
      SceneController.__super__.constructor.apply(this, arguments);
      this.mouse = new THREE.Vector3(0, 0, 0.5);
      this.objects = [];
      this.projector = new THREE.Projector();
      this.renderController = this.options.renderController;
      domElement = this.renderController.renderer.domElement;
      domElement.addEventListener('mousedown', this.onMouseDown);
      domElement.addEventListener('mousemove', this.onMouseMove);
      domElement.addEventListener('mouseup', this.onMouseUp);
      width = window.innerWidth;
      height = window.innerHeight;
      viewAngle = 10;
      aspectRatio = width / height;
      this.camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000);
      this.camera.position.z = 365;
      this.controls = new THREE.TrackballControls(this.camera);
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x222222, 0.002);
      ambientLight = new THREE.AmbientLight(0x222222);
      this.scene.add(ambientLight);
      pointLight = new THREE.PointLight(0xffffff, 1, 500);
      pointLight.position.set(250, 250, 250);
      this.scene.add(pointLight);
      D.loadGeometry('models/ducky.js').done(function(geometry) {
        var material, mesh, scale;
        material = new THREE.MeshNormalMaterial({
          shading: THREE.SmoothShading
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(scale = 10, scale, scale);
        mesh.rotation.set(0, Math.PI / 2, 0);
        _this.objects.push(mesh);
        return _this.scene.add(mesh);
      });
      parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: true
      };
      renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
      this.composer = new THREE.EffectComposer(this.renderController.renderer, renderTarget);
      foregroundPass = new THREE.RenderPass(this.scene, this.camera);
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
