import Stats from 'stats.js'
import { Piece } from './Piece'

type SceneOptions = {
  width: number
  height: number
  cols: number
  rows: number
  fade: number
}

const DEFAULT_OPTIONS: SceneOptions = {
  width: 465,
  height: 465,
  cols: 200,
  rows: 200,
  fade: 0.9,
}

export class ParticleBitmapScene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly stats: Stats
  private readonly imageData: ImageData
  private readonly pixels: Uint8ClampedArray
  private readonly options: SceneOptions
  private readonly offsetX: number
  private readonly offsetY: number

  private piece0: Piece | null = null
  private mouseX: number
  private mouseY: number
  private mouseDown = false

  constructor(root: HTMLElement, partialOptions: Partial<SceneOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...partialOptions }

    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.position = 'fixed'
    this.stats.dom.style.left = '0'
    this.stats.dom.style.top = '0'
    document.body.appendChild(this.stats.dom)

    root.innerHTML = `<canvas id="scene" width="${this.options.width}" height="${this.options.height}"></canvas>`
    const canvas = root.querySelector<HTMLCanvasElement>('#scene')
    if (!canvas) {
      throw new Error('Missing #scene canvas')
    }
    this.canvas = canvas

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not acquire 2D context')
    }
    this.ctx = ctx

    this.offsetX = Math.floor((this.options.width - this.options.cols * 2) / 2)
    this.offsetY = Math.floor((this.options.height - this.options.rows * 2) / 2)

    this.imageData = this.ctx.createImageData(this.options.width, this.options.height)
    this.pixels = this.imageData.data

    this.mouseX = this.options.width / 2
    this.mouseY = this.options.height / 2
  }

  public start(): void {
    this.setupPieces()
    this.setupInput()
    requestAnimationFrame(this.animate)
  }

  private setupPieces(): void {
    let prev: Piece | null = null

    for (let i = 0; i < this.options.cols; i++) {
      for (let j = 0; j < this.options.rows; j++) {
        const color = ((j / this.options.cols) * 255 << 16) | ((i / this.options.rows) * 255 << 8) | 180
        const p = new Piece(
          this.randomRange(-this.offsetX, this.options.width - this.offsetX),
          this.randomRange(-this.offsetY, this.options.height - this.offsetY),
          color,
        )

        p.damp = this.randomRange(50, 150) / 1000
        p.homeForce = this.randomRange(30, 90) / 10000
        p.setTarLoc(i * 2, j * 2)

        if (!this.piece0) {
          this.piece0 = p
        } else if (prev) {
          prev.next = p
        }
        prev = p
      }
    }
  }

  private setupInput(): void {
    this.canvas.addEventListener('pointermove', this.updateMousePosition)
    this.canvas.addEventListener('pointerdown', (event) => {
      this.updateMousePosition(event)
      this.mouseDown = true
    })
  }

  private readonly updateMousePosition = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    this.mouseX = event.clientX - rect.left
    this.mouseY = event.clientY - rect.top
  }

  private readonly animate = (): void => {
    this.stats.begin()

    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] *= this.options.fade
      this.pixels[i + 1] *= this.options.fade
      this.pixels[i + 2] *= this.options.fade
      this.pixels[i + 3] = 255
    }

    let force = -2
    if (this.mouseDown) {
      this.mouseDown = false
      force = -200
    }

    let p = this.piece0
    while (p) {
      p.addForce(this.mouseX - this.offsetX, this.mouseY - this.offsetY, 100, force)
      p.seekHome()
      p.addDamping()
      p.update()

      const px = (p.x + this.offsetX) | 0
      const py = (p.y + this.offsetY) | 0
      if (px >= 0 && px < this.options.width && py >= 0 && py < this.options.height) {
        const idx = (py * this.options.width + px) * 4
        this.pixels[idx] = (p.color >> 16) & 0xff
        this.pixels[idx + 1] = (p.color >> 8) & 0xff
        this.pixels[idx + 2] = p.color & 0xff
        this.pixels[idx + 3] = 255
      }

      p = p.next
    }

    this.ctx.putImageData(this.imageData, 0, 0)
    this.stats.end()
    requestAnimationFrame(this.animate)
  }

  private randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
