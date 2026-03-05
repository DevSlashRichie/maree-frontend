import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cart"!</div>
}
