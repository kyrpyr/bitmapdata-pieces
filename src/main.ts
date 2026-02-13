import './style.css'

const BMD_WIDTH = 465
const BMD_HEIGHT = 465
const COLOR_FADE = 0.9
const COLS = 200
const ROWS = 200

class Piece {
  public x: number
  public y: number
  public color: number
  public damp = 0
  public homeForce = 0
  public next: Piece | null = null

  private vx = 0
  private vy = 0
  private ax = 0
  private ay = 0
  private tx = 0
  private ty = 0

  constructor(x: number, y: number, color: number) {
    this.x = x
    this.y = y
    this.color = color
  }

  public update(): void {
    this.vx += this.ax
    this.vy += this.ay
    this.x += this.vx
    this.y += this.vy
    this.ax = 0
    this.ay = 0
  }

  public setTarLoc(x: number, y: number): void {
    this.tx = x
    this.ty = y
  }

  public addForce(x: number, y: number, minDist: number, scale: number): void {
    let dx = x - this.x
    let dy = y - this.y
    const distSq = dx * dx + dy * dy
    const minSq = minDist * minDist

    if (distSq > 0 && distSq < minSq) {
      const dist = Math.sqrt(distSq)
      const pct = 1 - dist / minDist
      dx = (dx / dist) * scale * pct
      dy = (dy / dist) * scale * pct
      this.ax += dx
      this.ay += dy
    }
  }

  public seekHome(): void {
    const dx = (this.tx - this.x) * this.homeForce
    const dy = (this.ty - this.y) * this.homeForce
    this.ax += dx
    this.ay += dy
  }

  public addDamping(): void {
    const dx = (this.ax - this.vx) * this.damp
    const dy = (this.ay - this.vy) * this.damp
    this.ax += dx
    this.ay += dy
  }
}

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing #app element')
}

app.innerHTML = '<canvas id="scene" width="465" height="465"></canvas>'
const canvas = document.querySelector<HTMLCanvasElement>('#scene')
if (!canvas) {
  throw new Error('Missing #scene canvas')
}
const canvasEl: HTMLCanvasElement = canvas

const ctx = canvas.getContext('2d')
if (!ctx) {
  throw new Error('Could not acquire 2D context')
}
const ctx2d: CanvasRenderingContext2D = ctx

const offsetX = Math.floor((BMD_WIDTH - COLS * 2) / 2)
const offsetY = Math.floor((BMD_HEIGHT - ROWS * 2) / 2)

let piece0: Piece | null = null
let prev: Piece | null = null

for (let i = 0; i < COLS; i++) {
  for (let j = 0; j < ROWS; j++) {
    const color = ((j / COLS) * 255 << 16) | ((i / ROWS) * 255 << 8) | 180
    const p = new Piece(
      randomRange(-offsetX, BMD_WIDTH - offsetX),
      randomRange(-offsetY, BMD_HEIGHT - offsetY),
      color,
    )
    p.damp = randomRange(50, 150) / 1000
    p.homeForce = randomRange(30, 90) / 10000
    p.setTarLoc(i * 2, j * 2)

    if (!piece0) {
      piece0 = p
    } else if (prev) {
      prev.next = p
    }
    prev = p
  }
}

const imageData = ctx.createImageData(BMD_WIDTH, BMD_HEIGHT)
const pixels = imageData.data

let mouseX = BMD_WIDTH / 2
let mouseY = BMD_HEIGHT / 2
let mouseDown = false

function updateMousePosition(event: PointerEvent): void {
  const rect = canvasEl.getBoundingClientRect()
  mouseX = event.clientX - rect.left
  mouseY = event.clientY - rect.top
}

canvasEl.addEventListener('pointermove', updateMousePosition)
canvasEl.addEventListener('pointerdown', (event) => {
  updateMousePosition(event)
  mouseDown = true
})

function animate(): void {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] *= COLOR_FADE
    pixels[i + 1] *= COLOR_FADE
    pixels[i + 2] *= COLOR_FADE
    pixels[i + 3] = 255
  }

  let force = -2
  if (mouseDown) {
    mouseDown = false
    force = -200
  }

  let p = piece0
  while (p) {
    p.addForce(mouseX - offsetX, mouseY - offsetY, 100, force)
    p.seekHome()
    p.addDamping()
    p.update()

    const px = (p.x + offsetX) | 0
    const py = (p.y + offsetY) | 0
    if (px >= 0 && px < BMD_WIDTH && py >= 0 && py < BMD_HEIGHT) {
      const idx = (py * BMD_WIDTH + px) * 4
      pixels[idx] = (p.color >> 16) & 0xff
      pixels[idx + 1] = (p.color >> 8) & 0xff
      pixels[idx + 2] = p.color & 0xff
      pixels[idx + 3] = 255
    }

    p = p.next
  }

  ctx2d.putImageData(imageData, 0, 0)
  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
