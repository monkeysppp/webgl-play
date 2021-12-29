import * as THREE from 'https://cdn.skypack.dev/three@latest'

document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvasDiv = document.getElementById('canvasDiv')
  const width = canvasDiv.style.width.replace('px', '')
  const height = canvasDiv.style.height.replace('px', '')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer()

  renderer.setSize(width, height)
  canvasDiv.appendChild(renderer.domElement)

  const cube = makeShapes()

  Object.keys(cube).forEach(f => {
    // First rotate around y by 45 deg
    const q1 = new THREE.Quaternion()
    q1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/4.0)
    cube[f].applyQuaternion(q1)
    // Then rotate around [1,0,0] (in the original frame) by enough to bring the diagonally opposite points over each other
    const q2 = new THREE.Quaternion()
    q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.asin(Math.sqrt(2)/Math.sqrt(3)))
    cube[f].applyQuaternion(q2)

    scene.add(cube[f])
  })

  camera.position.z = 7

  const animate = () => {
    const rotation = 0.035
    requestAnimationFrame(animate)
    Object.keys(cube).forEach(f => {
      const q = new THREE.Quaternion()
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
      cube[f].applyQuaternion(q)
    })
    renderer.render(scene, camera)
  }

  animate()
})

const makeShapes = () => {
  const ltf = { x:-1.0, y: 1.0, z:-1.0 }
  const lbf = { x:-1.0, y:-1.0, z:-1.0 }
  const rtf = { x: 1.0, y: 1.0, z:-1.0 }
  const rbf = { x: 1.0, y:-1.0, z:-1.0 }
  const ltb = { x:-1.0, y: 1.0, z: 1.0 }
  const lbb = { x:-1.0, y:-1.0, z: 1.0 }
  const rtb = { x: 1.0, y: 1.0, z: 1.0 }
  const rbb = { x: 1.0, y:-1.0, z: 1.0 }

  const frontGeometry  = new THREE.BufferGeometry()
  frontGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        lbf.x, lbf.y, lbf.z,
        ltf.x, ltf.y, ltf.z,
        rtf.x, rtf.y, rtf.z,
        lbf.x, lbf.y, lbf.z,
        rtf.x, rtf.y, rtf.z,
        rbf.x, rbf.y, rbf.z,
      ]),
    3)
  )
  const frontMaterial = new THREE.MeshBasicMaterial({ color: 0xc53737 })

  const rightGeometry  = new THREE.BufferGeometry()
  rightGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        rbf.x, rbf.y, rbf.z,
        rtf.x, rtf.y, rtf.z,
        rtb.x, rtb.y, rtb.z,
        rbf.x, rbf.y, rbf.z,
        rtb.x, rtb.y, rtb.z,
        rbb.x, rbb.y, rbb.z,
      ]),
    3)
  )
  const rightMaterial = new THREE.MeshBasicMaterial({ color: 0xbe5121 })

  const backGeometry   = new THREE.BufferGeometry()
  backGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        rbb.x, rbb.y, rbb.z,
        rtb.x, rtb.y, rtb.z,
        ltb.x, ltb.y, ltb.z,
        rbb.x, rbb.y, rbb.z,
        ltb.x, ltb.y, ltb.z,
        lbb.x, lbb.y, lbb.z,
      ]),
    3)
  )
  const backMaterial = new THREE.MeshBasicMaterial({ color: 0xc53737 })

  const leftGeometry   = new THREE.BufferGeometry()
  leftGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        lbb.x, lbb.y, lbb.z,
        ltb.x, ltb.y, ltb.z,
        ltf.x, ltf.y, ltf.z,
        lbb.x, lbb.y, lbb.z,
        ltf.x, ltf.y, ltf.z,
        lbf.x, lbf.y, lbf.z,
      ]),
    3)
  )
  const leftMaterial = new THREE.MeshBasicMaterial({ color: 0xbe5121 })

  const topGeometry    = new THREE.BufferGeometry()
  topGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        ltf.x, ltf.y, ltf.z,
        ltb.x, ltb.y, ltb.z,
        rtb.x, rtb.y, rtb.z,
        ltf.x, ltf.y, ltf.z,
        rtb.x, rtb.y, rtb.z,
        rtf.x, rtf.y, rtf.z,
      ]),
    3)
  )
  const topMaterial = new THREE.MeshBasicMaterial({ color: 0xbe7f21 })

  const bottomGeometry = new THREE.BufferGeometry()
  bottomGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array([
        lbb.x, lbb.y, lbb.z,
        lbf.x, lbf.y, lbf.z,
        rbf.x, rbf.y, rbf.z,
        lbb.x, lbb.y, lbb.z,
        rbf.x, rbf.y, rbf.z,
        rbb.x, rbb.y, rbb.z,
      ]),
    3)
  )
  const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0xbe7f21 })

  return {
    front: new THREE.Mesh(frontGeometry, frontMaterial),
    right: new THREE.Mesh(rightGeometry, rightMaterial),
    back: new THREE.Mesh(backGeometry, backMaterial),
    left: new THREE.Mesh(leftGeometry, leftMaterial),
    top: new THREE.Mesh(topGeometry, topMaterial),
    bottom: new THREE.Mesh(bottomGeometry, bottomMaterial)
  }
}
