import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/loyalty')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/loyalty"!</div>
}
