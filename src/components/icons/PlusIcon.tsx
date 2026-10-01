import type { SVGProps } from 'react'

export default function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="10.4" width="16" height="3.2" rx="1.6" fill="currentColor" />
      <rect x="10.4" y="4" width="3.2" height="16" rx="1.6" fill="currentColor" />
    </svg>
  )
}
