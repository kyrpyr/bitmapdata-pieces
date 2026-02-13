import { ControlEvent } from './ControlEvent'
import { ControlsModel, type ControlsState } from './ControlsModel'

export class ControlsView extends EventTarget {
  private readonly model: ControlsModel
  private readonly root: HTMLDivElement
  private readonly toggleButton: HTMLButtonElement
  private readonly fadeLabel: HTMLLabelElement
  private readonly fadeValue: HTMLSpanElement
  private readonly fadeSlider: HTMLInputElement

  constructor(model: ControlsModel) {
    super()
    this.model = model

    this.root = document.createElement('div')
    this.root.className = 'controls'

    this.toggleButton = document.createElement('button')
    this.toggleButton.type = 'button'
    this.toggleButton.addEventListener('click', this.handleToggleClick)

    this.fadeLabel = document.createElement('label')
    this.fadeLabel.className = 'controls-fade'
    this.fadeLabel.textContent = 'Fade '

    this.fadeValue = document.createElement('span')
    this.fadeValue.className = 'controls-fade-value'
    this.fadeLabel.appendChild(this.fadeValue)

    this.fadeSlider = document.createElement('input')
    this.fadeSlider.type = 'range'
    this.fadeSlider.min = '0.85'
    this.fadeSlider.max = '1'
    this.fadeSlider.step = '0.01'
    this.fadeSlider.addEventListener('input', this.handleFadeInput)
    this.fadeLabel.appendChild(this.fadeSlider)

    this.root.appendChild(this.toggleButton)
    this.root.appendChild(this.fadeLabel)
    document.body.appendChild(this.root)

    this.model.addEventListener('change', this.handleModelChange)
    this.render()
  }

  private readonly handleToggleClick = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      isRunning: !currentState.isRunning,
    })
  }

  private readonly handleFadeInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      fade: Number(this.fadeSlider.value),
    })
  }

  private readonly handleModelChange = (): void => {
    this.render()
  }

  private render(): void {
    const state = this.model.getState()
    this.toggleButton.textContent = state.isRunning ? 'Stop' : 'Start'
    const fade = state.fade
    this.fadeSlider.value = fade.toFixed(2)
    this.fadeValue.textContent = fade.toFixed(2)
  }

  private emitState(state: ControlsState): void {
    this.dispatchEvent(new ControlEvent(state))
  }
}
