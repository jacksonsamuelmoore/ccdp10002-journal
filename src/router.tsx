import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => <div>Error</div>,
    scrollRestoration: true,
  })

  return router
}
