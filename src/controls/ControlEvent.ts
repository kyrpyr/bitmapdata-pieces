import type { ControlsState } from './ControlsModel'

export class ControlEvent extends Event {
  public static readonly STATE_CHANGE = 'state_change'
  public static readonly RESET = 'reset'
  public readonly state: ControlsState | null

  constructor(type: string, state: ControlsState | null = null) {
    super(type)
    this.state = state
  }
}
