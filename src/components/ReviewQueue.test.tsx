import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReviewQueue from './ReviewQueue'

describe('ReviewQueue', () => {
  it('shows low-confidence review items first', () => {
    render(
      <ReviewQueue
        items={[
          {
            id: 'a',
            label: 'Infer story points',
            field: 'storyPoints',
            confidence: 'low',
            reason: 'Sizing signal not fully trusted yet.',
          },
          {
            id: 'b',
            label: 'Confirm PR gate',
            field: 'reviewPolicy',
            confidence: 'high',
            reason: 'Policy was found in a review artifact.',
          },
        ]}
      />,
    )

    expect(screen.getByText('Infer story points')).toBeInTheDocument()
  })
})
