import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/weeks/11')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/weeks/11"!</div>
}
