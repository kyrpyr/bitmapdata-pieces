import './style.css'
import { ParticleBitmapScene } from './ParticleBitmapScene'
import { ControlsController } from './controls/ControlsController'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing #app element')
}

const scene = new ParticleBitmapScene(app)
scene.start()
new ControlsController(scene)
