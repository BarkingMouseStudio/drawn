(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  D.EffectController = (function(_super) {

    __extends(EffectController, _super);

    function EffectController() {
      var effectComposer, initBackground, initComposers, initForeground,
        _this = this;
      EffectController.__super__.constructor.apply(this, arguments);
      this.renderController = this.options.renderController;
      initBackground = function(halfWidth, halfHeight) {
        var aspectRatio, camera, material, mesh, scene, size;
        camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 100);
        camera.position.z = 100;
        material = new THREE.MeshBasicMaterial({
          map: THREE.ImageUtils.loadTexture('images/sleeping_woman.png'),
          depthTest: false
        });
        size = 665;
        aspectRatio = 1230 / 1510;
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.position.y = 65;
        mesh.scale.set(size * aspectRatio, size, 1);
        scene = new THREE.Scene();
        scene.add(mesh);
        return [scene, camera];
      };
      initForeground = function(width, height) {
        var ambientLight, aspectRatio, camera, pointLight, scene, viewAngle;
        viewAngle = 10;
        aspectRatio = width / height;
        camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, 1, 10000);
        camera.position.z = 365;
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xffffff, 0.002);
        ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);
        pointLight = new THREE.PointLight(0xffffff, 1, 500);
        pointLight.position.set(250, 250, 250);
        scene.add(pointLight);
        D.loadGeometry('models/sleeping_woman_extruded.js').done(function(geometry) {
          var material, mesh, rotationControls;
          material = new THREE.MeshNormalMaterial();
          mesh = new THREE.Mesh(geometry, material);
          mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          scene.add(mesh);
          return rotationControls = new D.RotationController({
            el: _this.el,
            object: mesh,
            renderController: _this.renderController
          });
        });
        return [scene, camera];
      };
      initComposers = function(renderer, width, height) {
        var backgroundPass, backgroundScene, bluriness, clearMaskPass, effectComposer, foregroundMaskPass, foregroundPass, foregroundScene, hBlurPass1, hBlurPass2, ortographicCamera, parameters, perspectiveCamera, renderTarget, screenPass, vBlurPass1, vBlurPass2, vignettePass, _ref, _ref1;
        renderTarget = new THREE.WebGLRenderTarget(width, height, parameters = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: true
        });
        effectComposer = new THREE.EffectComposer(renderer, renderTarget);
        _ref = initBackground(width / 2, height / 2), backgroundScene = _ref[0], ortographicCamera = _ref[1];
        _ref1 = initForeground(width, height), foregroundScene = _ref1[0], perspectiveCamera = _ref1[1];
        backgroundPass = new THREE.RenderPass(backgroundScene, ortographicCamera);
        foregroundPass = new THREE.RenderPass(foregroundScene, perspectiveCamera);
        foregroundPass.clear = false;
        foregroundMaskPass = new THREE.MaskPass(foregroundScene, perspectiveCamera);
        foregroundMaskPass.inverse = true;
        clearMaskPass = new THREE.ClearMaskPass();
        hBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras['horizontalBlur']);
        vBlurPass1 = new THREE.ShaderPass(THREE.ShaderExtras['verticalBlur']);
        bluriness = 16;
        hBlurPass1.uniforms['h'].value = bluriness / width;
        vBlurPass1.uniforms['v'].value = bluriness / height;
        hBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras['horizontalBlur']);
        vBlurPass2 = new THREE.ShaderPass(THREE.ShaderExtras['verticalBlur']);
        bluriness = 4;
        hBlurPass2.uniforms['h'].value = bluriness / width;
        vBlurPass2.uniforms['v'].value = bluriness / height;
        vignettePass = new THREE.ShaderPass(THREE.ShaderExtras['vignette']);
        vignettePass.uniforms['offset'].value = 0.8;
        vignettePass.uniforms['darkness'].value = 2;
        vignettePass.renderToScreen = true;
        screenPass = new THREE.ShaderPass(THREE.ShaderExtras['screen']);
        screenPass.renderToScreen = true;
        effectComposer.addPass(backgroundPass);
        effectComposer.addPass(foregroundPass);
        effectComposer.addPass(screenPass);
        return effectComposer;
      };
      effectComposer = initComposers(this.renderController.renderer, window.innerWidth, window.innerHeight);
      this.renderController.on('afterRender', function() {
        return effectComposer.render(0.1);
      });
    }

    return EffectController;

  })(Backbone.View);

}).call(this);
