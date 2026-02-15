import Stats from 'stats.js'
import { Piece } from './Piece'

type SceneOptions = {
  dpi: number
  fade: number
}

export type SceneState = {
  isRunning: boolean
  fade: number
  clickForce: number
  damping: number
  influenceRadius: number
  idleForce: number
  homeForceMultiplier: number
  dpi: number
  particleCount: number
}

const DEFAULT_OPTIONS: SceneOptions = {
  dpi: 1,
  fade: 0.9,
}

const BASE_PARTICLE_DENSITY = 0.204
const MIN_PARTICLES = 10000
const MAX_PARTICLES = 640000

export class ParticleBitmapScene {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly stats: Stats
  private readonly options: SceneOptions

  private width = 0
  private height = 0
  private imageData: ImageData
  private pixels: Uint8ClampedArray
  private cols = 1
  private rows = 1
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
      clickForce: 200,
      damping: 1,
      influenceRadius: 100,
      idleForce: -2,
      homeForceMultiplier: 1,
      dpi: this.options.dpi,
      particleCount: 1,
    }

    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.style.position = 'fixed'
    this.stats.dom.style.left = '12px'
    this.stats.dom.style.right = 'auto'
    this.stats.dom.style.top = '12px'
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
    this.updateParticleLayout()
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
    this.state.clickForce = Math.max(50, Math.min(500, nextState.clickForce))
    this.state.damping = Math.max(0.5, Math.min(2, nextState.damping))
    this.state.influenceRadius = Math.max(20, Math.min(300, nextState.influenceRadius))
    this.state.idleForce = Math.max(-20, Math.min(20, nextState.idleForce))
    this.state.homeForceMultiplier = Math.max(0.1, Math.min(3, nextState.homeForceMultiplier))
    const nextDpi = Math.max(0.25, Math.min(2.5, nextState.dpi))
    if (Math.abs(nextDpi - this.state.dpi) > Number.EPSILON) {
      this.state.dpi = nextDpi
      const layoutChanged = this.updateParticleLayout()
      if (layoutChanged) {
        this.setupPieces()
      }
    } else if (this.state.particleCount !== this.cols * this.rows) {
      const layoutChanged = this.updateParticleLayout()
      if (layoutChanged) {
        this.setupPieces()
      }
    } else {
      this.state.particleCount = this.cols * this.rows
    }

    if (nextState.isRunning) {
      this.start()
    } else {
      this.stop()
    }
  }

  private updateParticleLayout(): boolean {
    const targetCount = Math.max(
      MIN_PARTICLES,
      Math.min(
        MAX_PARTICLES,
        Math.round(this.width * this.height * BASE_PARTICLE_DENSITY * this.state.dpi),
      ),
    )
    const aspect = this.width / this.height
    const nextCols = Math.max(1, Math.round(Math.sqrt(targetCount * aspect)))
    const nextRows = Math.max(1, Math.round(targetCount / nextCols))

    const changed = nextCols !== this.cols || nextRows !== this.rows
    this.cols = nextCols
    this.rows = nextRows
    this.state.particleCount = this.cols * this.rows
    this.targetStepX = this.width / this.cols
    this.targetStepY = this.height / this.rows

    return changed
  }

  public reset(): void {
    this.setupPieces()
  }

  private setupPieces(): void {
    this.piece0 = null
    let prev: Piece | null = null

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const red = Math.round((j / Math.max(1, this.rows - 1)) * 255)
        const green = Math.round((i / Math.max(1, this.cols - 1)) * 255)
        const color = (red << 16) | (green << 8) | 180
        const p = new Piece(
          this.randomRange(0, this.width - 1),
          this.randomRange(0, this.height - 1),
          color,
        )

        p.baseDamp = this.randomRange(50, 150) / 1000
        p.damp = p.baseDamp * this.state.damping
        p.baseHomeForce = this.randomRange(30, 90) / 10000
        p.homeForce = p.baseHomeForce * this.state.homeForceMultiplier
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

  private setupInput(): void {
    this.canvas.addEventListener('pointermove', this.updateMousePosition)
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      this.updateMousePosition(event)
      this.mouseDown = true
    })
    this.canvas.addEventListener('pointermove', (event) => {
      event.preventDefault()
    })
  }

  private resizeCanvas(): void {
    this.width = Math.max(1, Math.floor(window.innerWidth))
    this.height = Math.max(1, Math.floor(window.innerHeight))

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.imageData = this.ctx.createImageData(this.width, this.height)
    this.pixels = this.imageData.data

    this.updateParticleLayout()

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

    let force = this.state.idleForce
    if (this.mouseDown) {
      this.mouseDown = false
      force = -this.state.clickForce
    }

    let p = this.piece0
    while (p) {
      p.damp = p.baseDamp * this.state.damping
      p.homeForce = p.baseHomeForce * this.state.homeForceMultiplier
      p.addForce(this.mouseX, this.mouseY, this.state.influenceRadius, force)
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
