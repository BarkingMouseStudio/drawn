(function() {

  document.onselectstart = function() {
    return false;
  };

  window.D = {
    TWO_PI: Math.PI * 2
  };

  Deferred.installInto(Zepto);

}).call(this);
