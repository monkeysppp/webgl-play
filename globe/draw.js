import * as THREE from 'https://cdn.skypack.dev/three@v0.136.0'

document.addEventListener('DOMContentLoaded', () => {
  const globeImgCanvas = document.createElement('canvas')
  const globeImgContext = globeImgCanvas.getContext('2d')
  const globeImg = new Image()
  globeImg.addEventListener('load', function() {
    globeImgCanvas.width = globeImg.width
    globeImgCanvas.height = globeImg.height
    globeImgContext.drawImage(globeImg, 0, 0, globeImg.width, globeImg.height)
    const globeImgData = {
      width: globeImg.width,
      height: globeImg.height,
      // Just load the data once because looking up colors one point at a time is ridiculously slow!
      pixelData: globeImgContext.getImageData(0, 0, globeImg.width, globeImg.height).data
    }

    /* @type { HTMLCanvasElement } */
    const canvasDiv = document.getElementById('canvasDiv')
    const width = canvasDiv.style.width.replace('px', '')
    const height = canvasDiv.style.height.replace('px', '')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(10, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(width, height)
    canvasDiv.appendChild(renderer.domElement)

    const projector = makeProjector()
    const globe = makeGlobe(globeImgData)

    scene.add(projector.mesh)
    scene.add(globe.mesh)

    const sunLight = new THREE.DirectionalLight(0xffdf87, 1.0)
    sunLight.translateX(-5.0)
    sunLight.translateY(5.0)
    sunLight.translateZ(3.0)
    scene.add(sunLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.translateX(-12.0)
    sunLight.translateY(12.0)
    backLight.translateZ(-10.0)
    scene.add(backLight)

    // const fog
    scene.fog = new THREE.FogExp2(0x222288, 0.008)

    camera.position.z = 30
    camera.position.y = -0.5

    const animate = () => {
      const rotation = 0.0025
      globe.rotate(rotation)
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()
  }, false)
  globeImg.src = 'img/3840px-Blue_Marble_2002.png'
})

const makeGlobe = (globeImgData) => {
  const latCount = 100
  const ringDensity = 80
  const pointScale = 0.0035
  const radius = 1.5
  const earthMesh = new THREE.Object3D()
  const linesMesh = new THREE.Object3D()
  const globeMesh = new THREE.Object3D()

  for (let rLat = 1; rLat < latCount; rLat++) {
    const lat = rLat * (Math.PI / latCount)
    const ringRadius = radius * Math.sin(lat)
    const longCount = Math.floor(ringRadius * ringDensity)

    for (let rLong = 0; rLong < longCount; rLong++) {
      const dLong = 2 * Math.PI / longCount
      let long = rLong * dLong
      // Have a half-stop difference between each ring of dots
      if (rLat % 2 == 0) {
        long += 0.5 * dLong
      }

      const pointGeometry = new THREE.CircleGeometry(5, 12)
        .scale(pointScale, pointScale, pointScale)
        .translate(0.0, 0.0, radius)
        .rotateX(lat-(Math.PI/2.0))
        .rotateY(long)
      // const pointMaterial = new THREE.MeshBasicMaterial({ color: getColor(lat, long, globeImgData) })
      const pointColor = getColor(lat, long, globeImgData)
      const pointMaterial = new THREE.MeshPhongMaterial({
        color: pointColor,
        reflectivity: 0.75,
        emissive: pointColor,
        emissiveIntensity: 0.95,
        specular: pointColor,
        shininess: 25
      })
      const point = new THREE.Mesh(pointGeometry, pointMaterial)
      earthMesh.add(point)

      // The lines seem to be pretty intense, so only draw every other lat-line and long-line
      if (rLat % 2 == 0 && rLong % 2 == 0) {
        const effectiveRadius = radius * Math.sin(lat)
        const lightLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            effectiveRadius * Math.sin(long),
            radius * Math.cos(lat),
            effectiveRadius * Math.cos(long)
          ),
          new THREE.Vector3(0.0, -2.4, 0.0)
        ])
        const lightLineColor = getColor(lat, long, globeImgData)
        lightLineColor.multiplyScalar(2.0)
        const lightLineMaterial = new THREE.LineBasicMaterial({ color: lightLineColor })
        lightLineMaterial.setValues({ opacity: 0.05, transparent: true })
        const lightLine = new THREE.Line(lightLineGeometry, lightLineMaterial)
        linesMesh.add(lightLine)
      }
    }
  }

  const pointGeometryTop = new THREE.CircleGeometry(5, 12)
    .scale(pointScale, pointScale, pointScale)
    .translate(0.0, 0.0, radius)
    .rotateX(-(Math.PI/2.0))
  const pointMaterialTop = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const pointTop = new THREE.Mesh(pointGeometryTop, pointMaterialTop)
  earthMesh.add(pointTop)

  const pointGeometryBottom = new THREE.CircleGeometry(5, 12)
    .scale(pointScale, pointScale, pointScale)
    .translate(0.0, 0.0, radius)
    .rotateX((Math.PI/2.0))
  const pointMaterialBottom = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const pointBottom = new THREE.Mesh(pointGeometryBottom, pointMaterialBottom)
  earthMesh.add(pointBottom)

  const sphereGeometry = new THREE.SphereGeometry(radius - 0.001, 30, 30)
  const sphereColor = new THREE.Color(0x020a26)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: sphereColor,
    opacity: 0.75,
    transparent: true,
    emissive: sphereColor,
    emissiveIntensity: 0.1,
    specular: sphereColor,
    shininess: 10
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  earthMesh.add(sphere)

  const atmosGeometry = new THREE.SphereGeometry(radius + 0.025, 30, 30)
  const atmosColor = new THREE.Color(0x4a77f7)
  const atmosMaterial = new THREE.MeshPhongMaterial({
    color: atmosColor,
    opacity: 0.1,
    transparent: true,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.5,
    specular: atmosColor,
    shininess: 30
  })
  const atmos = new THREE.Mesh(atmosGeometry, atmosMaterial)
  earthMesh.add(atmos)

  globeMesh.add(earthMesh)
  globeMesh.add(linesMesh)

  globeMesh.rotateY(Math.PI * 1.0)

  return {
    rotate: (rotation) => {
      globeMesh.rotateY(rotation)
    },
    mesh: globeMesh
  }
}

const makeProjector = () => {
  const projectorMesh = new THREE.Object3D()
  const projectorColor = new THREE.Color(0x212121)
  const projectorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 12, 1, false)
    .translate(0.0, -2.4, 0.0)
  const projectorMaterial = new THREE.MeshPhongMaterial({
    color: projectorColor,
    specular: projectorColor,
    shininess: 20
  })
  const projector = new THREE.Mesh(projectorGeometry, projectorMaterial)

  const lensColor = new THREE.Color(0x468699)
  const lensGeometry = new THREE.SphereGeometry(0.5, 12, 5, 0, Math.PI * 2.0, 0, 0.4)
  .translate(0.0, -2.73, 0.0)
  const lensMaterial = new THREE.MeshPhongMaterial({
    color: lensColor,
    opacity: 0.75,
    transparent: true,
    emissive: lensColor,
    emissiveIntensity: 1.0,
    specular: lensColor,
    shininess: 5000
  })
  const lens = new THREE.Mesh(lensGeometry, lensMaterial)

  projectorMesh.add(projector)
  projectorMesh.add(lens)

  return {
    mesh: projectorMesh,
    rotate: (rotation) => {}
  }
}

/**
 * getColor looks up a lat,long point on the image and returns a Three.Color object for the color of that pixel
 *
 * Since the image we're using is of an equirectangular projection (https://en.wikipedia.org/wiki/Equirectangular_projection)
 * we can just scale lat,long against the width,height to get the point of interest
 *
 * @param {number} lat          The latitude of the point to get the color for
 * @param {number} long         The longitude of the point to get the color for
 * @param {object} globeImgData The width, height and pixel-data for the image we want to extract the colors from
 *
 * @return {THREE.Color} The color of the requested location
 */
const getColor = (lat, long, globeImgData) => {
  const x = Math.round(globeImgData.width * (long / (2.0 * Math.PI)))
  const y = Math.round(globeImgData.height * (lat / (Math.PI)))
  const offset = (globeImgData.width * 4 * y) + (4 * x)
  const pixel = [globeImgData.pixelData[offset], globeImgData.pixelData[offset+1], globeImgData.pixelData[offset+2]]
  return new THREE.Color(pixel[0]/256, pixel[1]/256, pixel[2]/256)
}
