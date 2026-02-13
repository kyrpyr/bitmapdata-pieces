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

const sourceLink = document.createElement('a')
sourceLink.className = 'github-button'
sourceLink.href = 'https://github.com/kyrpyr/bitmapdata-pieces'
sourceLink.target = '_blank'
sourceLink.rel = 'noopener noreferrer'
sourceLink.textContent = 'View on GitHub'
document.body.appendChild(sourceLink)
