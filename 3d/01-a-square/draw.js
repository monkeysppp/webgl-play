document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvas = document.getElementById('canvas')

  /* @type { WebGLRenderingContext } */
  c = canvas.getContext('webgl')
  if (c === null) return

  // Make everything dark grey
  c.clearColor(0.1, 0.1, 0.1, 1.0)
  c.clear(c.COLOR_BUFFER_BIT)

  // Shader program = vertex shader + fragment shader

  // vertex shader
  const vsSource = `
    attribute vec4 aVertexPosition; // input vertex position
    attribute vec4 aVertexColor;    // input vertex color

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
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
  const programInfo = {
    program: shaderProgram,
    attribLocations: { // attributes receive values from buffers
      vertexPosition: c.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: c.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: { // uniforms are like global variables
      projectionMatrix: c.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: c.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  }
  const shapes = initBuffers(c)
  drawScene(c, programInfo, shapes)
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

const initBuffers = (c) => {
  // Create a buffer to put the coordinates into
  const positionBuffer = c.createBuffer()
  // Select the positionBuffer as the one to apply buffer operations to from here out.
  c.bindBuffer(c.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.
  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ]

  // Now pass the list of positions into WebGL to build the shape. We do this by creating
  // a Float32Array from the JavaScript array, then use it to fill the current buffer.
  c.bufferData(c.ARRAY_BUFFER, new Float32Array(positions), c.STATIC_DRAW)

  const colors = [ // R G B A
    197/256, 55/256,  55/256, 1.0, // #c53737
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 81/256,  33/256, 1.0, // #be5121
    190/256, 127/256, 33/256, 1.0, // #be7f21
  ]

  const colorBuffer = c.createBuffer()
  c.bindBuffer(c.ARRAY_BUFFER, colorBuffer)
  c.bufferData(c.ARRAY_BUFFER, new Float32Array(colors), c.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer
  }
}

const drawScene = (c, programInfo, buffers) => {
  c.clearColor(0.1, 0.1, 0.1, 1.0)  // Clear to dark grey, fully opaque
  c.clearDepth(1.0)                 // Clear everything
  c.enable(c.DEPTH_TEST)            // Enable depth testing
  c.depthFunc(c.LEQUAL)             // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180   // in radians
  const aspect = c.canvas.clientWidth / c.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar)

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create()

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0])   // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2   // pull out 2 values per iteration
    const type = c.FLOAT      // the data in the buffer is 32bit floats
    const normalize = false   // don't normalize
    const stride = 0          // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0          // how many bytes inside the buffer to start from
    c.bindBuffer(c.ARRAY_BUFFER, buffers.position)
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
    c.bindBuffer(c.ARRAY_BUFFER, buffers.color)
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

  {
    const offset = 0
    const vertexCount = 4
    c.drawArrays(c.TRIANGLE_STRIP, offset, vertexCount)
  }
}
