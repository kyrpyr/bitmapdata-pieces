export class ControlsModel extends EventTarget {
  private isRunning: boolean

  constructor(initialRunning: boolean) {
    super()
    this.isRunning = initialRunning
  }

  public setRunning(next: boolean): void {
    if (this.isRunning === next) {
      return
    }

    this.isRunning = next
    this.dispatchEvent(new Event('change'))
  }

  public getRunning(): boolean {
    return this.isRunning
  }
}
