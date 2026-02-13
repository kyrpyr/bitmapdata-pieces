import { ParticleBitmapScene } from '../ParticleBitmapScene'
import { ControlEvent } from './ControlEvent'
import { ControlsModel, type ControlsState } from './ControlsModel'
import { ControlsView } from './ControlsView'

export class ControlsController {
  private readonly scene: ParticleBitmapScene
  private readonly model: ControlsModel
  private readonly view: ControlsView

  constructor(scene: ParticleBitmapScene) {
    this.scene = scene
    this.model = new ControlsModel(this.scene.getState())
    this.view = new ControlsView(this.model)
    this.view.addEventListener(ControlEvent.STATE_CHANGE, this.handleStateEvent)
  }

  private readonly handleStateEvent = (event: Event): void => {
    if (event.type !== ControlEvent.STATE_CHANGE) {
      return
    }

    const stateEvent = event as ControlEvent
    const nextState: ControlsState = stateEvent.state

    this.scene.setState(nextState)
    this.model.setState(this.scene.getState())
  }
}
