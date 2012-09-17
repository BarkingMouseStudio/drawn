(function() {

  D.loadMesh = function(url, material) {
    var geometry, loader, mesh;
    geometry = new THREE.SphereGeometry(50, 128, 128);
    mesh = new THREE.Mesh(geometry, material);
    loader = new THREE.GeometryLoader();
    loader.addEventListener('error', function(event) {
      throw new Error(event.message);
    });
    loader.addEventListener('load', function(event) {
      return THREE.Mesh.call(mesh, event.content, material);
    });
    loader.load(url);
    return mesh;
  };

}).call(this);
