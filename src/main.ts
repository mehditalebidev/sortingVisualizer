import './style.css'
import { bootstrapComparePage } from '@/app/compareBootstrap'
import { bootstrapApp } from '@/app/bootstrap'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'

if (normalizedPath === '/compare') {
  bootstrapComparePage(app)
} else {
  bootstrapApp(app)
}
