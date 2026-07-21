import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xe8eef5)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(5, 5, 5)

const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const controls = new OrbitControls(camera, renderer.domElement)

controls.enableDamping = true
controls.dampingFactor = 0.05

controls.target.set(0, 0, 0)

const grid = new THREE.GridHelper(100, 100)
scene.add(grid)

const axes = new THREE.AxesHelper(5)
scene.add(axes)

const light = new THREE.DirectionalLight(0xffffff, 2)
light.position.set(10, 20, 10)
scene.add(light)

const ambient = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambient)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    )

})