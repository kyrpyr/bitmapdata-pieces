import { ParticleBitmapScene } from '../ParticleBitmapScene'
import { ControlEvent } from './ControlEvent'
import { ControlsModel } from './ControlsModel'
import { ControlsView } from './ControlsView'

export class ControlsController {
  private readonly scene: ParticleBitmapScene
  private readonly model: ControlsModel
  private readonly view: ControlsView

  constructor(scene: ParticleBitmapScene) {
    this.scene = scene
    this.model = new ControlsModel(this.scene.getRunningState())
    this.view = new ControlsView(this.model)
    this.view.addEventListener(ControlEvent.TOGGLE, this.handleControlEvent)
  }

  private readonly handleControlEvent = (event: Event): void => {
    if (event.type !== ControlEvent.TOGGLE) {
      return
    }

    if (this.model.getRunning()) {
      this.scene.stop()
    } else {
      this.scene.start()
    }

    this.model.setRunning(this.scene.getRunningState())
  }
}
