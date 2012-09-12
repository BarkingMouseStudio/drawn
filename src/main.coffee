WIDTH = 400
HEIGHT = 300
VIEW_ANGLE = 45
ASPECT = WIDTH / HEIGHT
NEAR = 0.1
FAR = 10000


renderer = new THREE.WebGLRenderer()
camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)
scene = new THREE.Scene()

scene.add camera

camera.position.z = 300

renderer.setSize WIDTH, HEIGHT

$container = $("#container")
$container.append renderer.domElement