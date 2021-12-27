document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvas = document.getElementById('canvas')

  /* @type { CanvasRenderingContext2D } */
  const c = canvas.getContext('2d')

  const left = Math.round(canvas.width * 0.1)
  const right = Math.round(canvas.width * 0.9)
  const top = Math.round(canvas.height * 0.1)
  const bottom = Math.round(canvas.height * 0.9)

  drawBox(c, left, top, (right - left), (bottom - top))
  drawCorner(c,
    Math.round(canvas.width * 0.15),
    Math.round(canvas.height * 0.15),
    Math.round(canvas.width * 0.1),
    Math.round(canvas.height * 0.1))
  drawCorner(c,
    Math.round(canvas.width * 0.75),
    Math.round(canvas.height * 0.15),
    Math.round(canvas.width * 0.1),
    Math.round(canvas.height * 0.1))
  drawCorner(c,
    Math.round(canvas.width * 0.75),
    Math.round(canvas.height * 0.75),
    Math.round(canvas.width * 0.1),
    Math.round(canvas.height * 0.1))
  drawCorner(c,
    Math.round(canvas.width * 0.15),
    Math.round(canvas.height * 0.75),
    Math.round(canvas.width * 0.1),
    Math.round(canvas.height * 0.1),
    true)
  drawHole(c,
    Math.round(canvas.width * 0.45),
    Math.round(canvas.height * 0.45),
    Math.round(canvas.width * 0.1),
    Math.round(canvas.height * 0.1))
})

const drawCorner = (c, left, top, width, height, shadow) => {
  c.beginPath()
  c.rect(left, top, width, height)
  if (shadow) {
    // c.fillStyle = 'rgba(197, 55, 70, 1.0)'
    c.strokeStyle = 'rgba(250,250,250,1.0)'
  } else {
    c.fillStyle = 'rgba(197, 55, 70, 1.0)'
    c.strokeStyle = 'rgba(250,250,250,1.0)'
    c.fill()
  }
  c.stroke()
}

const drawBox = (c, left, top, width, height) => {
  c.beginPath()
  c.rect(left, top, width, height)
  c.fillStyle = 'rgba(55, 197, 94, 1.0)'
  c.strokeStyle = 'rgba(55, 197, 94, 1.0)'
  c.fill()
  c.stroke()
}

const drawHole = (c, left, top, width, height) => {
  c.clearRect(left, top, width, height)
}
