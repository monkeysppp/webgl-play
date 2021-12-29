document.addEventListener('DOMContentLoaded', () => {
  /* @type { HTMLCanvasElement } */
  const canvas = document.getElementById('canvas')

  /* @type { CanvasRenderingContext2D } */
  c = canvas.getContext('2d')

  const scale = Math.round(canvas.clientWidth * 0.005)
  const radius = 4 * scale

  let x = Math.random() * canvas.clientWidth
  let y = ((Math.random() * 0.5) + 0.3) * canvas.clientHeight
  let xDir = 1
  let dy = 0

  c.fillStyle = 'rgba(55, 197, 94, 1.0)'
  let vx = 5.0
  const drawBall = () => {
    let dx
    if (vx < 0.25  ) {
      dx = 0
    } else {
      dx = vx
      if (x + dx + radius > canvas.clientWidth) {
        xDir = -1
        vx *= 0.9
      } else if (x + dx < radius) {
        vx *= 0.9
        xDir = 1
      } else {
        vx -= 0.005
      }

      dy += 0.15
      if (y + dy + radius > canvas.clientHeight) {
        dy = (0.4 - dy) * 0.9

        if ((dy * dy) < 0.2 ) {
          dy = 0
          y = canvas.clientHeight - radius
        }
        vx -= 0.005
      }
    }

    // console.log(`dx=${dx} : dy=${dy}`)

    x += (dx * xDir)
    y += (dy)

    c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    c.beginPath()
    c.arc(x, y, radius, 0, 2 * Math.PI)
    c.fill()

    if (dx !== 0 || dy !== 0) {
      requestAnimationFrame(drawBall)
    }
  }

  requestAnimationFrame(drawBall)
})
