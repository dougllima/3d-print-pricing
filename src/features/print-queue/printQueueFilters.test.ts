import { describe, expect, it } from 'vitest'

import type { PrintQueueItem, PrintQueueStatus } from '@/shared/types'

import {
  canReorderPrintQueueItem,
  countPrintQueueItemsByFilter,
  filterPrintQueueItems,
  sortPrintQueueItems,
} from './printQueueFilters'

const now = '2026-06-18T10:00:00.000Z'

function createQueueItem(input: {
  id: string
  isActive?: boolean
  position: number
  status: PrintQueueStatus
}): PrintQueueItem {
  return {
    id: input.id,
    printProfileId: 'profile-1',
    printRunId: 'run-1',
    position: input.position,
    status: input.status,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  }
}

const queueItems = [
  createQueueItem({ id: 'finished', position: 4, status: 'finished' }),
  createQueueItem({ id: 'queued', position: 2, status: 'queued' }),
  createQueueItem({ id: 'archived', isActive: false, position: 1, status: 'queued' }),
  createQueueItem({ id: 'canceled', position: 5, status: 'canceled' }),
  createQueueItem({ id: 'started', position: 3, status: 'started' }),
]

describe('print queue filters', () => {
  it('sorts queue items by position', () => {
    expect(sortPrintQueueItems(queueItems).map((item) => item.id)).toEqual([
      'archived',
      'queued',
      'started',
      'finished',
      'canceled',
    ])
  })

  it('hides archived items and returns only active workflow items by default', () => {
    expect(filterPrintQueueItems(queueItems, 'active').map((item) => item.id)).toEqual([
      'queued',
      'started',
    ])
  })

  it('filters active queue history by status', () => {
    expect(filterPrintQueueItems(queueItems, 'finished').map((item) => item.id)).toEqual([
      'finished',
    ])
    expect(filterPrintQueueItems(queueItems, 'canceled').map((item) => item.id)).toEqual([
      'canceled',
    ])
  })

  it('counts all filters using only non-archived items', () => {
    expect(countPrintQueueItemsByFilter(queueItems)).toEqual({
      active: 2,
      all: 4,
      canceled: 1,
      finished: 1,
      queued: 1,
      started: 1,
    })
  })

  it('allows reordering only queued and started items', () => {
    expect(canReorderPrintQueueItem(createQueueItem({ id: 'queued', position: 1, status: 'queued' }))).toBe(
      true,
    )
    expect(
      canReorderPrintQueueItem(createQueueItem({ id: 'finished', position: 1, status: 'finished' })),
    ).toBe(false)
  })
})
