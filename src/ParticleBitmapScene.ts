import Stats from 'stats.js'
import { Piece } from './Piece'

type SceneOptions = {
  cols: number
  rows: number
  fade: number
}

export type SceneState = {
  isRunning: boolean
  fade: number
}

const DEFAULT_OPTIONS: SceneOptions = {
  cols: 500,
  rows: 500,
  fade: 0.9,
}

export class ParticleBitmapScene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly stats: Stats
  private readonly options: SceneOptions

  private width = 0
  private height = 0
  private imageData: ImageData
  private pixels: Uint8ClampedArray
  private targetStepX = 0
  private targetStepY = 0
  private piece0: Piece | null = null
  private mouseX = 0
  private mouseY = 0
  private mouseDown = false
  private isStarted = false
  private state: SceneState
  private frameId: number | null = null

  constructor(root: HTMLElement, partialOptions: Partial<SceneOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...partialOptions }
    this.state = {
      isRunning: false,
      fade: this.options.fade,
    }

    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.position = 'fixed'
    this.stats.dom.style.left = 'auto'
    this.stats.dom.style.right = '0'
    this.stats.dom.style.top = '0'
    document.body.appendChild(this.stats.dom)

    root.innerHTML = '<canvas id="scene"></canvas>'
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

    this.imageData = this.ctx.createImageData(1, 1)
    this.pixels = this.imageData.data
    this.resizeCanvas()
    this.setupPieces()
  }

  public start(): void {
    if (!this.isStarted) {
      this.setupInput()
      window.addEventListener('resize', this.handleResize)
      this.isStarted = true
    }

    if (this.state.isRunning) {
      return
    }

    this.state.isRunning = true
    this.frameId = requestAnimationFrame(this.animate)
  }

  public stop(): void {
    this.state.isRunning = false
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  public getState(): SceneState {
    return { ...this.state }
  }

  public setState(nextState: SceneState): void {
    this.state.fade = Math.max(0.85, Math.min(1, nextState.fade))

    if (nextState.isRunning) {
      this.start()
    } else {
      this.stop()
    }
  }

  public reset(): void {
    this.resetSimulation()
  }

  private setupPieces(): void {
    this.piece0 = null
    let prev: Piece | null = null

    for (let i = 0; i < this.options.cols; i++) {
      for (let j = 0; j < this.options.rows; j++) {
        const color = ((j / this.options.cols) * 255 << 16) | ((i / this.options.rows) * 255 << 8) | 180
        const p = new Piece(
          this.randomRange(0, this.width - 1),
          this.randomRange(0, this.height - 1),
          color,
        )

        p.damp = this.randomRange(50, 150) / 1000
        p.homeForce = this.randomRange(30, 90) / 10000
        // Small jitter breaks strict scanline bands on dense grids.
        p.setTarLoc(
          (i + Math.random()) * this.targetStepX,
          (j + Math.random()) * this.targetStepY,
        )

        if (!this.piece0) {
          this.piece0 = p
        } else if (prev) {
          prev.next = p
        }
        prev = p
      }
    }
  }

  private resetSimulation(): void {
    this.setupPieces()
    this.clearFrameBuffer()
  }

  private clearFrameBuffer(): void {
    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] = 0
      this.pixels[i + 1] = 0
      this.pixels[i + 2] = 0
      this.pixels[i + 3] = 255
    }
  }

  private setupInput(): void {
    this.canvas.addEventListener('pointermove', this.updateMousePosition)
    this.canvas.addEventListener('pointerdown', (event) => {
      this.updateMousePosition(event)
      this.mouseDown = true
    })
  }

  private resizeCanvas(): void {
    this.width = Math.max(1, Math.floor(window.innerWidth))
    this.height = Math.max(1, Math.floor(window.innerHeight))

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.imageData = this.ctx.createImageData(this.width, this.height)
    this.pixels = this.imageData.data

    this.targetStepX = this.width / this.options.cols
    this.targetStepY = this.height / this.options.rows

    this.mouseX = this.width / 2
    this.mouseY = this.height / 2
  }

  private readonly handleResize = (): void => {
    this.resizeCanvas()
    this.setupPieces()
  }

  private readonly updateMousePosition = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    this.mouseX = event.clientX - rect.left
    this.mouseY = event.clientY - rect.top
  }

  private readonly animate = (): void => {
    if (!this.state.isRunning) {
      return
    }

    this.stats.begin()

    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] *= this.state.fade
      this.pixels[i + 1] *= this.state.fade
      this.pixels[i + 2] *= this.state.fade
      this.pixels[i + 3] = 255
    }

    let force = -2
    if (this.mouseDown) {
      this.mouseDown = false
      force = -200
    }

    let p = this.piece0
    while (p) {
      p.addForce(this.mouseX, this.mouseY, 100, force)
      p.seekHome()
      p.addDamping()
      p.update()

      const px = p.x | 0
      const py = p.y | 0
      if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
        const idx = (py * this.width + px) * 4
        this.pixels[idx] = (p.color >> 16) & 0xff
        this.pixels[idx + 1] = (p.color >> 8) & 0xff
        this.pixels[idx + 2] = p.color & 0xff
        this.pixels[idx + 3] = 255
      }

      p = p.next
    }

    this.ctx.putImageData(this.imageData, 0, 0)
    this.stats.end()
    this.frameId = requestAnimationFrame(this.animate)
  }

  private randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}
