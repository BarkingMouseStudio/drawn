document.onselectstart = -> false

window.D =
  TWO_PI: Math.PI * 2

Deferred.installInto(Zepto)
