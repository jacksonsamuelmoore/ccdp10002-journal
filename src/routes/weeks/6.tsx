import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/weeks/6')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/weeks/6"!</div>
}
