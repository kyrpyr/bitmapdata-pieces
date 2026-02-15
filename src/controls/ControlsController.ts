import { ParticleBitmapScene } from '../ParticleBitmapScene'
import { ControlEvent } from './ControlEvent'
import { ControlsModel, type ControlsState } from './ControlsModel'
import { ControlsView } from './ControlsView'

export class ControlsController {
  private readonly scene: ParticleBitmapScene
  private readonly model: ControlsModel
  private readonly view: ControlsView
  private resizeSyncFrame: number | null = null

  constructor(scene: ParticleBitmapScene) {
    this.scene = scene
    this.model = new ControlsModel(this.scene.getState())
    this.view = new ControlsView(this.model)
    this.view.addEventListener(ControlEvent.STATE_CHANGE, this.handleStateEvent)
    this.view.addEventListener(ControlEvent.RESET, this.handleResetEvent)
    window.addEventListener('resize', this.handleViewportResize)
  }

  private readonly handleStateEvent = (event: Event): void => {
    if (event.type !== ControlEvent.STATE_CHANGE) {
      return
    }

    const stateEvent = event as ControlEvent
    if (!stateEvent.state) {
      return
    }

    const nextState: ControlsState = stateEvent.state

    this.scene.setState(nextState)
    this.model.setState(this.scene.getState())
  }

  private readonly handleResetEvent = (event: Event): void => {
    if (event.type !== ControlEvent.RESET) {
      return
    }

    this.scene.reset()
    this.model.setState(this.scene.getState())
  }

  private readonly handleViewportResize = (): void => {
    if (this.resizeSyncFrame !== null) {
      cancelAnimationFrame(this.resizeSyncFrame)
    }

    this.resizeSyncFrame = requestAnimationFrame(() => {
      this.resizeSyncFrame = null
      this.model.setState(this.scene.getState())
    })
  }
}
