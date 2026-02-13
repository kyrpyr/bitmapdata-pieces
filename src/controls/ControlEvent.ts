import type { ControlsState } from './ControlsModel'

export class ControlEvent extends Event {
  public static readonly STATE_CHANGE = 'state_change'
  public readonly state: ControlsState

  constructor(state: ControlsState) {
    super(ControlEvent.STATE_CHANGE)
    this.state = state
  }
}
