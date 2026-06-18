import type { Material, PrintProfile, PrintQueueItem } from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

type MaterialRequirement = {
  materialId: string
  requiredWeightGrams: number
}

type QueueOperationResult =
  | {
      item: PrintQueueItem
      materials: Material[]
      success: true
    }
  | {
      message: string
      success: false
    }

type PrintQueueItemDetailsInput = {
  clientName?: string
  deadline?: string
  price?: number
}

function normalizeOptionalText(value: string | undefined) {
  const normalizedValue = value?.trim()

  return normalizedValue === '' ? undefined : normalizedValue
}

function getMaterialUsages(printRun: PrintProfile['printRuns'][number]) {
  return printRun.plates.flatMap((plate) => plate.materials)
}

function getMaterialUsageWeight(materialUsage: ReturnType<typeof getMaterialUsages>[number]) {
  return (
    materialUsage.modelWeightGrams +
    materialUsage.supportWeightGrams +
    materialUsage.purgeWeightGrams +
    materialUsage.otherWasteGrams
  )
}

function findPrintRun(input: {
  item: PrintQueueItem
  printProfiles: PrintProfile[]
}) {
  const printProfile = input.printProfiles.find(
    (currentPrintProfile) => currentPrintProfile.id === input.item.printProfileId,
  )

  return printProfile?.printRuns.find((printRun) => printRun.id === input.item.printRunId)
}

export function getPrintRunMaterialRequirements(
  printRun: PrintProfile['printRuns'][number],
): MaterialRequirement[] | undefined {
  const requirementsByMaterialId = new Map<string, number>()

  for (const materialUsage of getMaterialUsages(printRun)) {
    if (materialUsage.materialId === undefined) {
      return undefined
    }

    requirementsByMaterialId.set(
      materialUsage.materialId,
      (requirementsByMaterialId.get(materialUsage.materialId) ?? 0) +
        getMaterialUsageWeight(materialUsage),
    )
  }

  return Array.from(requirementsByMaterialId.entries()).map(
    ([materialId, requiredWeightGrams]) => ({
      materialId,
      requiredWeightGrams,
    }),
  )
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

export function updatePrintQueueItemDetails(input: {
  item: PrintQueueItem
  now?: string
  values: PrintQueueItemDetailsInput
}): PrintQueueItem {
  return {
    ...input.item,
    clientName: normalizeOptionalText(input.values.clientName),
    deadline: normalizeOptionalText(input.values.deadline),
    price: input.values.price,
    updatedAt: input.now ?? createTimestamp(),
  }
}

export function startPrintQueueItem(input: {
  item: PrintQueueItem
  materials: Material[]
  now?: string
  printProfiles: PrintProfile[]
}): QueueOperationResult {
  const now = input.now ?? createTimestamp()

  if (input.item.status !== 'queued') {
    return {
      message: 'Apenas itens na fila podem ser iniciados.',
      success: false,
    }
  }

  if (input.item.stockConsumedAt !== undefined) {
    return {
      item: {
        ...input.item,
        startedAt: input.item.startedAt ?? now,
        status: 'started',
        updatedAt: now,
      },
      materials: input.materials,
      success: true,
    }
  }

  const printRun = findPrintRun({
    item: input.item,
    printProfiles: input.printProfiles,
  })

  if (printRun === undefined) {
    return {
      message: 'Impressão da fila não encontrada.',
      success: false,
    }
  }

  const materialRequirements = getPrintRunMaterialRequirements(printRun)

  if (materialRequirements === undefined) {
    return {
      message: 'Defina todos os filamentos antes de iniciar.',
      success: false,
    }
  }

  for (const materialRequirement of materialRequirements) {
    const material = input.materials.find(
      (currentMaterial) => currentMaterial.id === materialRequirement.materialId,
    )

    if (material === undefined) {
      return {
        message: 'Material da impressão não encontrado.',
        success: false,
      }
    }

    if (
      material.remainingWeightGrams !== undefined &&
      materialRequirement.requiredWeightGrams > material.remainingWeightGrams
    ) {
      return {
        message: `Estoque insuficiente para ${material.name}.`,
        success: false,
      }
    }
  }

  const materials = input.materials.map((material) => {
    const materialRequirement = materialRequirements.find(
      (requirement) => requirement.materialId === material.id,
    )

    if (
      materialRequirement === undefined ||
      material.remainingWeightGrams === undefined
    ) {
      return material
    }

    return {
      ...material,
      remainingWeightGrams:
        material.remainingWeightGrams - materialRequirement.requiredWeightGrams,
      updatedAt: now,
    }
  })

  return {
    item: {
      ...input.item,
      startedAt: input.item.startedAt ?? now,
      status: 'started',
      stockConsumedAt: now,
      updatedAt: now,
    },
    materials,
    success: true,
  }
}

export function finishPrintQueueItem(input: {
  item: PrintQueueItem
  now?: string
}): QueueOperationResult {
  const now = input.now ?? createTimestamp()

  if (input.item.status !== 'started') {
    return {
      message: 'Apenas itens iniciados podem ser finalizados.',
      success: false,
    }
  }

  return {
    item: {
      ...input.item,
      finishedAt: input.item.finishedAt ?? now,
      status: 'finished',
      updatedAt: now,
    },
    materials: [],
    success: true,
  }
}

export function cancelPrintQueueItem(input: {
  item: PrintQueueItem
  now?: string
}): QueueOperationResult {
  const now = input.now ?? createTimestamp()

  if (input.item.status === 'finished') {
    return {
      message: 'Itens finalizados não podem ser cancelados.',
      success: false,
    }
  }

  return {
    item: {
      ...input.item,
      status: 'canceled',
      updatedAt: now,
    },
    materials: [],
    success: true,
  }
}

export function archivePrintQueueItem(input: {
  item: PrintQueueItem
  now?: string
}): PrintQueueItem {
  return {
    ...input.item,
    isActive: false,
    updatedAt: input.now ?? createTimestamp(),
  }
}
