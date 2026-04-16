import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/components/LandingPage'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'ReAdmit Guard — Prevent Hospital Readmissions | LAU Health' },
      {
        name: 'description',
        content:
          'AI-powered post-discharge monitoring to prevent 30-day hospital readmissions. Built by LAU Health.',
      },
    ],
  }),
  component: LandingPage,
})
