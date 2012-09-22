(function() {

  D.random = function(min, max) {
    if (min == null) {
      min = -1;
    }
    if (max == null) {
      max = 1;
    }
    return Math.random() * (max - min) + min;
  };

  D.loadGeometry = function(url) {
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

  D.degreesToRadians = function(degrees) {
    return degrees * (Math.PI / 180);
  };

  D.radiansToDegrees = function(radians) {
    return radians * (180 / Math.PI);
  };

}).call(this);
