import { ControlEvent } from './ControlEvent'
import { ControlsModel, type ControlsState } from './ControlsModel'

export class ControlsView extends EventTarget {
  private readonly model: ControlsModel
  private readonly root: HTMLDivElement
  private readonly toggleButton: HTMLButtonElement
  private readonly resetButton: HTMLButtonElement
  private readonly fadeLabel: HTMLLabelElement
  private readonly fadeHead: HTMLDivElement
  private readonly fadeTitle: HTMLSpanElement
  private readonly fadeValue: HTMLSpanElement
  private readonly fadeSlider: HTMLInputElement
  private readonly forceLabel: HTMLLabelElement
  private readonly forceHead: HTMLDivElement
  private readonly forceTitle: HTMLSpanElement
  private readonly forceValue: HTMLSpanElement
  private readonly forceSlider: HTMLInputElement

  constructor(model: ControlsModel) {
    super()
    this.model = model

    this.root = document.createElement('div')
    this.root.className = 'controls'

    this.toggleButton = document.createElement('button')
    this.toggleButton.type = 'button'
    this.toggleButton.addEventListener('click', this.handleToggleClick)

    this.resetButton = document.createElement('button')
    this.resetButton.type = 'button'
    this.resetButton.textContent = 'Reset'
    this.resetButton.addEventListener('click', this.handleResetClick)

    this.fadeLabel = document.createElement('label')
    this.fadeLabel.className = 'controls-fade'
    this.fadeHead = document.createElement('div')
    this.fadeHead.className = 'controls-line'
    this.fadeTitle = document.createElement('span')
    this.fadeTitle.textContent = 'Fade'
    this.fadeHead.appendChild(this.fadeTitle)

    this.fadeValue = document.createElement('span')
    this.fadeValue.className = 'controls-fade-value'
    this.fadeHead.appendChild(this.fadeValue)
    this.fadeLabel.appendChild(this.fadeHead)

    this.fadeSlider = document.createElement('input')
    this.fadeSlider.type = 'range'
    this.fadeSlider.min = '0.85'
    this.fadeSlider.max = '1'
    this.fadeSlider.step = '0.01'
    this.fadeSlider.addEventListener('input', this.handleFadeInput)
    this.fadeLabel.appendChild(this.fadeSlider)

    this.forceLabel = document.createElement('label')
    this.forceLabel.className = 'controls-fade'
    this.forceHead = document.createElement('div')
    this.forceHead.className = 'controls-line'
    this.forceTitle = document.createElement('span')
    this.forceTitle.textContent = 'Click force'
    this.forceHead.appendChild(this.forceTitle)

    this.forceValue = document.createElement('span')
    this.forceValue.className = 'controls-fade-value'
    this.forceHead.appendChild(this.forceValue)
    this.forceLabel.appendChild(this.forceHead)

    this.forceSlider = document.createElement('input')
    this.forceSlider.type = 'range'
    this.forceSlider.min = '50'
    this.forceSlider.max = '500'
    this.forceSlider.step = '10'
    this.forceSlider.addEventListener('input', this.handleForceInput)
    this.forceLabel.appendChild(this.forceSlider)

    this.root.appendChild(this.toggleButton)
    this.root.appendChild(this.resetButton)
    this.root.appendChild(this.fadeLabel)
    this.root.appendChild(this.forceLabel)
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

  private readonly handleForceInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      clickForce: Number(this.forceSlider.value),
    })
  }

  private readonly handleResetClick = (): void => {
    this.dispatchEvent(new ControlEvent(ControlEvent.RESET))
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
    this.forceSlider.value = String(state.clickForce)
    this.forceValue.textContent = String(Math.round(state.clickForce))
  }

  private emitState(state: ControlsState): void {
    this.dispatchEvent(new ControlEvent(ControlEvent.STATE_CHANGE, state))
  }
}
