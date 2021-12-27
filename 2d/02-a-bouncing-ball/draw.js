document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvas = document.getElementById('canvas')

  /* @type { CanvasRenderingContext2D } */
  c = canvas.getContext('2d')

  const scale = Math.round(canvas.width * 0.005)
  const radius = 4 * scale

  let x = Math.random() * canvas.width
  let y = ((Math.random() * 0.5) + 0.3) * canvas.height
  let xDir = 1
  let dy = 0

  c.fillStyle = 'rgba(55, 197, 94, 1.0)'
  const drawBall = () => {
    let dx = 5
    if (x + dx > canvas.width) {
      xDir = -1
    } else if (x + dx < 2*radius) {
      xDir = 1
    }

    dy += 0.15
    if (y + dy > canvas.height + radius) {
      dy = -dy
    }

    x += (dx * xDir)
    y += (dy)

    c.clearRect(0, 0, canvas.width, canvas.height)
    c.beginPath()
    c.arc(x - radius,
      y - radius,
      radius,
      0,
      2 * Math.PI
    )
    c.fill()

    requestAnimationFrame(drawBall)
  }

  requestAnimationFrame(drawBall)
})
