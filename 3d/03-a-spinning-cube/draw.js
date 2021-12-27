let c
let programInfo
let shapes
const rotationSpeed = 0.002

document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvas = document.getElementById('canvas')

  /* @type { WebGLRenderingContext } */
  c = canvas.getContext('webgl')
  if (c === null) return

  c.clearColor(0.1, 0.1, 0.1, 1.0)
  c.clear(c.COLOR_BUFFER_BIT)

  const vsSource = `
    attribute vec4 aVertexPosition; // input vertex position
    attribute vec4 aVertexColor;    // input vertex color

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uTranslationMatrix;
    uniform mat4 uRotationMatrix;
    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * uRotationMatrix * uTranslationMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `



  // fragment shader
  const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `

  const shaderProgram = initShaderProgram(c, vsSource, fsSource)
  programInfo = {
    program: shaderProgram,
    attribLocations: { // attributes receive values from buffers
      vertexPosition: c.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: c.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: { // uniforms are like global variables
      projectionMatrix: c.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: c.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      rotationMatrix: c.getUniformLocation(shaderProgram, 'uRotationMatrix'),
      translationMatrix: c.getUniformLocation(shaderProgram, 'uTranslationMatrix'),
    },
  }
  shapes = makeShapes(c)
  then = 0
  requestAnimationFrame(drawScene)
})

const initShaderProgram = (c, vsSource, fsSource) => {
  const vertexShader = loadShader(c, c.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(c, c.FRAGMENT_SHADER, fsSource)
  const shaderProgram = c.createProgram()
  c.attachShader(shaderProgram, vertexShader)
  c.attachShader(shaderProgram, fragmentShader)
  c.linkProgram(shaderProgram)

  if (!c.getProgramParameter(shaderProgram, c.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + c.getProgramInfoLog(shaderProgram))
    return null
  }
  return shaderProgram
}

const loadShader = (c, type, source) => {
  const shader = c.createShader(type)
  c.shaderSource(shader, source)
  c.compileShader(shader)
  if (!c.getShaderParameter(shader, c.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + c.getShaderInfoLog(shader))
    c.deleteShader(shader)
    return null
  }
  return shader
}

const makeShapes = (c) => {
  const cubeBuffer = c.createBuffer()
  c.bindBuffer(c.ARRAY_BUFFER, cubeBuffer)

  const ltf = vec3.fromValues(-1.0,  1.0, -1.0)
  const lbf = vec3.fromValues(-1.0, -1.0, -1.0)
  const rtf = vec3.fromValues( 1.0,  1.0, -1.0)
  const rbf = vec3.fromValues( 1.0, -1.0, -1.0)
  const ltb = vec3.fromValues(-1.0,  1.0,  1.0)
  const lbb = vec3.fromValues(-1.0, -1.0,  1.0)
  const rtb = vec3.fromValues( 1.0,  1.0,  1.0)
  const rbb = vec3.fromValues( 1.0, -1.0,  1.0)

  const cube = [
    lbf[0], lbf[1], lbf[2],
    ltf[0], ltf[1], ltf[2],
    rtf[0], rtf[1], rtf[2],
    lbf[0], lbf[1], lbf[2],
    rtf[0], rtf[1], rtf[2],
    rbf[0], rbf[1], rbf[2],
    rbf[0], rbf[1], rbf[2],
    rtf[0], rtf[1], rtf[2],
    rtb[0], rtb[1], rtb[2],
    rbf[0], rbf[1], rbf[2],
    rtb[0], rtb[1], rtb[2],
    rbb[0], rbb[1], rbb[2],
    rbb[0], rbb[1], rbb[2],
    rtb[0], rtb[1], rtb[2],
    ltb[0], ltb[1], ltb[2],
    rbb[0], rbb[1], rbb[2],
    ltb[0], ltb[1], ltb[2],
    lbb[0], lbb[1], lbb[2],
    lbb[0], lbb[1], lbb[2],
    ltb[0], ltb[1], ltb[2],
    ltf[0], ltf[1], ltf[2],
    lbb[0], lbb[1], lbb[2],
    ltf[0], ltf[1], ltf[2],
    lbf[0], lbf[1], lbf[2],
    ltf[0], ltf[1], ltf[2],
    ltb[0], ltb[1], ltb[2],
    rtb[0], rtb[1], rtb[2],
    ltf[0], ltf[1], ltf[2],
    rtb[0], rtb[1], rtb[2],
    rtf[0], rtf[1], rtf[2],
    lbb[0], lbb[1], lbb[2],
    lbf[0], lbf[1], lbf[2],
    rbf[0], rbf[1], rbf[2],
    lbb[0], lbb[1], lbb[2],
    rbf[0], rbf[1], rbf[2],
    rbb[0], rbb[1], rbb[2],
  ]

  c.bufferData(c.ARRAY_BUFFER, new Float32Array(cube), c.STATIC_DRAW)

  const colors = [ // R G B A
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    197/256, 55/256,  55/256, 1.0, // #c53737
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
    190/256, 127/256, 33/256, 1.0, // #be7f21
  ]

  const colorBuffer = c.createBuffer()
  c.bindBuffer(c.ARRAY_BUFFER, colorBuffer)
  c.bufferData(c.ARRAY_BUFFER, new Float32Array(colors), c.STATIC_DRAW)

  return {
    position: cubeBuffer,
    color: colorBuffer
  }
}

const drawScene = (now) => {
  const rotation = now * rotationSpeed

  c.clearColor(0.1, 0.1, 0.1, 1.0)  // Clear to dark grey, fully opaque
  c.clearDepth(1.0)                 // Clear everything
  c.enable(c.DEPTH_TEST)            // Enable depth testing
  c.depthFunc(c.LEQUAL)             // Near things obscure far things
  c.enable(c.CULL_FACE)
  c.enable(c.DEPTH_TEST)

  // Clear the canvas before we start drawing on it.
  c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT)

  const fieldOfView = 45 * Math.PI / 180
  const aspect = c.canvas.clientWidth / c.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -7.0])

  const translationMatrix = mat4.create()
  // First rotate around y by 45 deg
  mat4.rotate(translationMatrix, translationMatrix, Math.PI/4.0, vec3.fromValues(0.0, 1.0, 0.0))
  // Then rotate around [1,0,-1] (which is [1,0,0] in the original frame) by enough to bring the diagonally opposite points over each other
  mat4.rotate(translationMatrix, translationMatrix, Math.asin(Math.sqrt(2)/Math.sqrt(3)), vec3.fromValues(1.0, 0.0, -1.0))

  const rotationMatrix = mat4.create()
  mat4.rotate(rotationMatrix, rotationMatrix, rotation, vec3.fromValues(0.0, 1.0, 0.0))

  {
    const numComponents = 3   // pull out 2 values per iteration
    const type = c.FLOAT      // the data in the buffer is 32bit floats
    const normalize = false   // don't normalize
    const stride = 0          // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0          // how many bytes inside the buffer to start from
    c.bindBuffer(c.ARRAY_BUFFER, shapes.position)
    c.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset)
    c.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition)
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4
    const type = c.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    c.bindBuffer(c.ARRAY_BUFFER, shapes.color)
    c.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset)
    c.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
  }

  // Tell WebGL to use our program when drawing
  c.useProgram(programInfo.program)

  // Set the shader uniforms
  c.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
  c.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)
  c.uniformMatrix4fv(programInfo.uniformLocations.rotationMatrix, false, rotationMatrix)
  c.uniformMatrix4fv(programInfo.uniformLocations.translationMatrix, false, translationMatrix)

  {
    const offset = 0
    const vertexCount = 36
    c.drawArrays(c.TRIANGLES, offset, vertexCount)
  }

  requestAnimationFrame(drawScene)
}
