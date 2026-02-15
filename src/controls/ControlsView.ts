import { ControlEvent } from './ControlEvent'
import { ControlsModel, type ControlsState } from './ControlsModel'

type PresetConfig = {
  id: string
  label: string
  fade: number
  clickForce: number
  damping: number
  influenceRadius: number
  idleForce: number
  homeForceMultiplier: number
  dpi: number
}

const PRESETS: PresetConfig[] = [
  {
    id: 'default',
    label: 'Default',
    fade: 0.9,
    clickForce: 200,
    damping: 1,
    influenceRadius: 100,
    idleForce: -2,
    homeForceMultiplier: 1,
    dpi: 1,
  },
  {
    id: 'image',
    label: 'Fun',
    fade: 0.9,
    clickForce: 500,
    damping: 1,
    influenceRadius: 75,
    idleForce: 11,
    homeForceMultiplier: 0.1,
    dpi: 1,
  },
  {
    id: 'vortex',
    label: 'Vortex',
    fade: 0.96,
    clickForce: 420,
    damping: 0.72,
    influenceRadius: 220,
    idleForce: 6,
    homeForceMultiplier: 0.45,
    dpi: 1,
  },
  {
    id: 'calm-rain',
    label: 'Calm Rain',
    fade: 0.89,
    clickForce: 120,
    damping: 1.55,
    influenceRadius: 65,
    idleForce: -4,
    homeForceMultiplier: 1.65,
    dpi: 1,
  },
  {
    id: 'explosion',
    label: 'Explosion',
    fade: 0.995,
    clickForce: 500,
    damping: 0.55,
    influenceRadius: 280,
    idleForce: 14,
    homeForceMultiplier: 0.2,
    dpi: 1,
  },
]

export class ControlsView extends EventTarget {
  private readonly model: ControlsModel
  private readonly root: HTMLDivElement
  private readonly presetLabel: HTMLLabelElement
  private readonly presetHead: HTMLDivElement
  private readonly presetTitle: HTMLSpanElement
  private readonly presetSelect: HTMLSelectElement
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
  private readonly dampingLabel: HTMLLabelElement
  private readonly dampingHead: HTMLDivElement
  private readonly dampingTitle: HTMLSpanElement
  private readonly dampingValue: HTMLSpanElement
  private readonly dampingSlider: HTMLInputElement
  private readonly radiusLabel: HTMLLabelElement
  private readonly radiusHead: HTMLDivElement
  private readonly radiusTitle: HTMLSpanElement
  private readonly radiusValue: HTMLSpanElement
  private readonly radiusSlider: HTMLInputElement
  private readonly idleForceLabel: HTMLLabelElement
  private readonly idleForceHead: HTMLDivElement
  private readonly idleForceTitle: HTMLSpanElement
  private readonly idleForceValue: HTMLSpanElement
  private readonly idleForceSlider: HTMLInputElement
  private readonly homeForceLabel: HTMLLabelElement
  private readonly homeForceHead: HTMLDivElement
  private readonly homeForceTitle: HTMLSpanElement
  private readonly homeForceValue: HTMLSpanElement
  private readonly homeForceSlider: HTMLInputElement
  private readonly particlesLabel: HTMLLabelElement
  private readonly particlesHead: HTMLDivElement
  private readonly particlesTitle: HTMLSpanElement
  private readonly particlesValue: HTMLSpanElement
  private readonly particlesSlider: HTMLInputElement

  constructor(model: ControlsModel) {
    super()
    this.model = model

    this.root = document.createElement('div')
    this.root.className = 'controls'

    this.presetLabel = document.createElement('label')
    this.presetLabel.className = 'controls-fade'
    this.presetHead = document.createElement('div')
    this.presetHead.className = 'controls-line'
    this.presetTitle = document.createElement('span')
    this.presetTitle.textContent = 'Preset'
    this.presetHead.appendChild(this.presetTitle)
    this.presetLabel.appendChild(this.presetHead)

    this.presetSelect = document.createElement('select')
    this.presetSelect.className = 'controls-select'
    for (const preset of PRESETS) {
      const option = document.createElement('option')
      option.value = preset.id
      option.textContent = preset.label
      this.presetSelect.appendChild(option)
    }
    const customOption = document.createElement('option')
    customOption.value = 'custom'
    customOption.textContent = 'Custom'
    this.presetSelect.appendChild(customOption)
    this.presetSelect.addEventListener('change', this.handlePresetChange)
    this.presetLabel.appendChild(this.presetSelect)

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

    this.dampingLabel = document.createElement('label')
    this.dampingLabel.className = 'controls-fade'
    this.dampingHead = document.createElement('div')
    this.dampingHead.className = 'controls-line'
    this.dampingTitle = document.createElement('span')
    this.dampingTitle.textContent = 'Damping'
    this.dampingHead.appendChild(this.dampingTitle)

    this.dampingValue = document.createElement('span')
    this.dampingValue.className = 'controls-fade-value'
    this.dampingHead.appendChild(this.dampingValue)
    this.dampingLabel.appendChild(this.dampingHead)

    this.dampingSlider = document.createElement('input')
    this.dampingSlider.type = 'range'
    this.dampingSlider.min = '0.5'
    this.dampingSlider.max = '2'
    this.dampingSlider.step = '0.01'
    this.dampingSlider.addEventListener('input', this.handleDampingInput)
    this.dampingLabel.appendChild(this.dampingSlider)

    this.radiusLabel = document.createElement('label')
    this.radiusLabel.className = 'controls-fade'
    this.radiusHead = document.createElement('div')
    this.radiusHead.className = 'controls-line'
    this.radiusTitle = document.createElement('span')
    this.radiusTitle.textContent = 'Radius'
    this.radiusHead.appendChild(this.radiusTitle)

    this.radiusValue = document.createElement('span')
    this.radiusValue.className = 'controls-fade-value'
    this.radiusHead.appendChild(this.radiusValue)
    this.radiusLabel.appendChild(this.radiusHead)

    this.radiusSlider = document.createElement('input')
    this.radiusSlider.type = 'range'
    this.radiusSlider.min = '20'
    this.radiusSlider.max = '300'
    this.radiusSlider.step = '5'
    this.radiusSlider.addEventListener('input', this.handleRadiusInput)
    this.radiusLabel.appendChild(this.radiusSlider)

    this.idleForceLabel = document.createElement('label')
    this.idleForceLabel.className = 'controls-fade'
    this.idleForceHead = document.createElement('div')
    this.idleForceHead.className = 'controls-line'
    this.idleForceTitle = document.createElement('span')
    this.idleForceTitle.textContent = 'Idle force'
    this.idleForceHead.appendChild(this.idleForceTitle)

    this.idleForceValue = document.createElement('span')
    this.idleForceValue.className = 'controls-fade-value'
    this.idleForceHead.appendChild(this.idleForceValue)
    this.idleForceLabel.appendChild(this.idleForceHead)

    this.idleForceSlider = document.createElement('input')
    this.idleForceSlider.type = 'range'
    this.idleForceSlider.min = '-20'
    this.idleForceSlider.max = '20'
    this.idleForceSlider.step = '1'
    this.idleForceSlider.addEventListener('input', this.handleIdleForceInput)
    this.idleForceLabel.appendChild(this.idleForceSlider)

    this.homeForceLabel = document.createElement('label')
    this.homeForceLabel.className = 'controls-fade'
    this.homeForceHead = document.createElement('div')
    this.homeForceHead.className = 'controls-line'
    this.homeForceTitle = document.createElement('span')
    this.homeForceTitle.textContent = 'Home force'
    this.homeForceHead.appendChild(this.homeForceTitle)

    this.homeForceValue = document.createElement('span')
    this.homeForceValue.className = 'controls-fade-value'
    this.homeForceHead.appendChild(this.homeForceValue)
    this.homeForceLabel.appendChild(this.homeForceHead)

    this.homeForceSlider = document.createElement('input')
    this.homeForceSlider.type = 'range'
    this.homeForceSlider.min = '0.1'
    this.homeForceSlider.max = '3'
    this.homeForceSlider.step = '0.01'
    this.homeForceSlider.addEventListener('input', this.handleHomeForceInput)
    this.homeForceLabel.appendChild(this.homeForceSlider)

    this.particlesLabel = document.createElement('label')
    this.particlesLabel.className = 'controls-fade'
    this.particlesHead = document.createElement('div')
    this.particlesHead.className = 'controls-line'
    this.particlesTitle = document.createElement('span')
    this.particlesTitle.textContent = 'DPI'
    this.particlesHead.appendChild(this.particlesTitle)

    this.particlesValue = document.createElement('span')
    this.particlesValue.className = 'controls-fade-value'
    this.particlesHead.appendChild(this.particlesValue)
    this.particlesLabel.appendChild(this.particlesHead)

    this.particlesSlider = document.createElement('input')
    this.particlesSlider.type = 'range'
    this.particlesSlider.min = '0.25'
    this.particlesSlider.max = '2.5'
    this.particlesSlider.step = '0.05'
    this.particlesSlider.addEventListener('input', this.handleParticlesInput)
    this.particlesLabel.appendChild(this.particlesSlider)

    this.root.appendChild(this.presetLabel)
    this.root.appendChild(this.particlesLabel)
    this.root.appendChild(this.toggleButton)
    this.root.appendChild(this.resetButton)
    this.root.appendChild(this.fadeLabel)
    this.root.appendChild(this.forceLabel)
    this.root.appendChild(this.dampingLabel)
    this.root.appendChild(this.radiusLabel)
    this.root.appendChild(this.idleForceLabel)
    this.root.appendChild(this.homeForceLabel)
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

  private readonly handleDampingInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      damping: Number(this.dampingSlider.value),
    })
  }

  private readonly handleRadiusInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      influenceRadius: Number(this.radiusSlider.value),
    })
  }

  private readonly handleIdleForceInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      idleForce: Number(this.idleForceSlider.value),
    })
  }

  private readonly handleHomeForceInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      homeForceMultiplier: Number(this.homeForceSlider.value),
    })
  }

  private readonly handleParticlesInput = (): void => {
    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      dpi: Number(this.particlesSlider.value),
    })
  }

  private readonly handleResetClick = (): void => {
    this.dispatchEvent(new ControlEvent(ControlEvent.RESET))
  }

  private readonly handlePresetChange = (): void => {
    const preset = PRESETS.find((item) => item.id === this.presetSelect.value)
    if (!preset) {
      return
    }

    const currentState = this.model.getState()
    this.emitState({
      ...currentState,
      fade: preset.fade,
      clickForce: preset.clickForce,
      damping: preset.damping,
      influenceRadius: preset.influenceRadius,
      idleForce: preset.idleForce,
      homeForceMultiplier: preset.homeForceMultiplier,
      dpi: preset.dpi,
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
    this.forceSlider.value = String(state.clickForce)
    this.forceValue.textContent = String(Math.round(state.clickForce))
    this.dampingSlider.value = state.damping.toFixed(2)
    this.dampingValue.textContent = state.damping.toFixed(2)
    this.radiusSlider.value = String(Math.round(state.influenceRadius))
    this.radiusValue.textContent = String(Math.round(state.influenceRadius))
    this.idleForceSlider.value = String(Math.round(state.idleForce))
    this.idleForceValue.textContent = String(Math.round(state.idleForce))
    this.homeForceSlider.value = state.homeForceMultiplier.toFixed(2)
    this.homeForceValue.textContent = state.homeForceMultiplier.toFixed(2)
    this.particlesSlider.value = state.dpi.toFixed(2)
    this.particlesValue.textContent = `${state.dpi.toFixed(2)} (${state.particleCount.toLocaleString()})`
    this.presetSelect.value = this.matchPresetId(state)
  }

  private emitState(state: ControlsState): void {
    this.dispatchEvent(new ControlEvent(ControlEvent.STATE_CHANGE, state))
  }

  private matchPresetId(state: ControlsState): string {
    for (const preset of PRESETS) {
      if (
        state.fade === preset.fade &&
        state.clickForce === preset.clickForce &&
        state.damping === preset.damping &&
        state.influenceRadius === preset.influenceRadius &&
        state.idleForce === preset.idleForce &&
        state.homeForceMultiplier === preset.homeForceMultiplier &&
        state.dpi === preset.dpi
      ) {
        return preset.id
      }
    }
    return 'custom'
  }
}
