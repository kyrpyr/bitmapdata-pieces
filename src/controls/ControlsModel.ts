export type ControlsState = {
  isRunning: boolean
  fade: number
  clickForce: number
  damping: number
  influenceRadius: number
  idleForce: number
  homeForceMultiplier: number
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
      this.state.clickForce === nextState.clickForce &&
      this.state.damping === nextState.damping &&
      this.state.influenceRadius === nextState.influenceRadius &&
      this.state.idleForce === nextState.idleForce &&
      this.state.homeForceMultiplier === nextState.homeForceMultiplier
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
