import { ParticleBitmapScene } from './ParticleBitmapScene'

export class SimulationControls {
  private readonly scene: ParticleBitmapScene
  private readonly root: HTMLDivElement
  private readonly toggleButton: HTMLButtonElement

  constructor(scene: ParticleBitmapScene) {
    this.scene = scene

    this.root = document.createElement('div')
    this.root.className = 'controls'

    this.toggleButton = document.createElement('button')
    this.toggleButton.type = 'button'
    this.toggleButton.textContent = this.scene.getRunningState() ? 'Stop' : 'Start'
    this.toggleButton.addEventListener('click', this.handleToggle)

    this.root.appendChild(this.toggleButton)
    document.body.appendChild(this.root)
  }

  private readonly handleToggle = (): void => {
    if (this.scene.getRunningState()) {
      this.scene.stop()
      this.toggleButton.textContent = 'Start'
    } else {
      this.scene.start()
      this.toggleButton.textContent = 'Stop'
    }
  }
}
