import { ControlEvent } from './ControlEvent'
import { ControlsModel } from './ControlsModel'

export class ControlsView extends EventTarget {
  private readonly model: ControlsModel
  private readonly root: HTMLDivElement
  private readonly toggleButton: HTMLButtonElement

  constructor(model: ControlsModel) {
    super()
    this.model = model

    this.root = document.createElement('div')
    this.root.className = 'controls'

    this.toggleButton = document.createElement('button')
    this.toggleButton.type = 'button'
    this.toggleButton.addEventListener('click', this.handleToggleClick)

    this.root.appendChild(this.toggleButton)
    document.body.appendChild(this.root)

    this.model.addEventListener('change', this.handleModelChange)
    this.render()
  }

  private readonly handleToggleClick = (): void => {
    this.dispatchEvent(new ControlEvent(ControlEvent.TOGGLE))
  }

  private readonly handleModelChange = (): void => {
    this.render()
  }

  private render(): void {
    this.toggleButton.textContent = this.model.getRunning() ? 'Stop' : 'Start'
  }
}
