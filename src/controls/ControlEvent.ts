export class ControlEvent extends Event {
  public static readonly TOGGLE = 'toggle'

  constructor(type: string) {
    super(type)
  }
}
