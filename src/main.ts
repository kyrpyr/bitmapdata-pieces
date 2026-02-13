import './style.css'
import { ParticleBitmapScene } from './ParticleBitmapScene'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing #app element')
}

const scene = new ParticleBitmapScene(app)
scene.start()
