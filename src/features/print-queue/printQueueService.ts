import type { Material, PrintProfile, PrintQueueItem } from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

function getMaterialUsages(printRun: PrintProfile['printRuns'][number]) {
  return printRun.plates.flatMap((plate) => plate.materials)
}

export function canAddPrintRunToQueue(input: {
  materials: Material[]
  printRun: PrintProfile['printRuns'][number]
}) {
  return getMaterialUsages(input.printRun).every(
    (materialUsage) =>
      materialUsage.materialId !== undefined &&
      input.materials.some((material) => material.id === materialUsage.materialId),
  )
}

export function getNextQueuePosition(items: PrintQueueItem[]) {
  if (items.length === 0) {
    return 0
  }

  return Math.max(...items.map((item) => item.position)) + 1
}

export function createPrintQueueItem(input: {
  existingItems: PrintQueueItem[]
  printProfileId: string
  printRunId: string
}): PrintQueueItem {
  const now = createTimestamp()

  return {
    id: createEntityId(),
    printProfileId: input.printProfileId,
    printRunId: input.printRunId,
    position: getNextQueuePosition(input.existingItems),
    status: 'queued',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}
