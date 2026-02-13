export class Piece {
  public x: number
  public y: number
  public color: number
  public damp = 0
  public homeForce = 0
  public next: Piece | null = null

  private vx = 0
  private vy = 0
  private ax = 0
  private ay = 0
  private tx = 0
  private ty = 0

  constructor(x: number, y: number, color: number) {
    this.x = x
    this.y = y
    this.color = color
  }

  public update(): void {
    this.vx += this.ax
    this.vy += this.ay
    this.x += this.vx
    this.y += this.vy
    this.ax = 0
    this.ay = 0
  }

  public setTarLoc(x: number, y: number): void {
    this.tx = x
    this.ty = y
  }

  public addForce(x: number, y: number, minDist: number, scale: number): void {
    let dx = x - this.x
    let dy = y - this.y
    const distSq = dx * dx + dy * dy
    const minSq = minDist * minDist

    if (distSq > 0 && distSq < minSq) {
      const dist = Math.sqrt(distSq)
      const pct = 1 - dist / minDist
      dx = (dx / dist) * scale * pct
      dy = (dy / dist) * scale * pct
      this.ax += dx
      this.ay += dy
    }
  }

  public seekHome(): void {
    const dx = (this.tx - this.x) * this.homeForce
    const dy = (this.ty - this.y) * this.homeForce
    this.ax += dx
    this.ay += dy
  }

  public addDamping(): void {
    const dx = (this.ax - this.vx) * this.damp
    const dy = (this.ay - this.vy) * this.damp
    this.ax += dx
    this.ay += dy
  }
}
