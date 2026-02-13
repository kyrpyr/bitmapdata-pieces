export type ControlsState = {
  isRunning: boolean
  fade: number
  clickForce: number
}

export class ControlsModel extends EventTarget {
  private state: ControlsState

  constructor(initialState: ControlsState) {
    super()
    this.state = { ...initialState }
  }

  public setState(nextState: ControlsState): void {
    if (
      this.state.isRunning === nextState.isRunning &&
      this.state.fade === nextState.fade &&
      this.state.clickForce === nextState.clickForce
    ) {
      return
    }

    this.state = { ...nextState }
    this.dispatchEvent(new Event('change'))
  }

  public getState(): ControlsState {
    return { ...this.state }
  }
}
