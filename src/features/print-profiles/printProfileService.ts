import type { PrintProfile } from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

import type { PrintProfileFormValues } from './printProfileFormSchema'

export function createPrintProfileFromFormValues(input: {
  editingPrintProfile?: PrintProfile
  values: PrintProfileFormValues
}): PrintProfile {
  const now = createTimestamp()

  return {
    id: input.editingPrintProfile?.id ?? createEntityId(),
    productId: input.values.productId,
    name: input.values.name,
    printerId: input.values.printerId,
    printRuns: input.values.printRuns.map((printRun) => ({
      id: printRun.id,
      quantity: printRun.quantity,
      printTimeMinutes: printRun.printTimeHours * 60 + printRun.printTimeMinutesPart,
      materials: printRun.materials,
    })),
    slicerProfileName: input.values.slicerProfileName,
    layerHeightMm: input.values.layerHeightMm,
    nozzleDiameterMm: input.values.nozzleDiameterMm,
    infillPercent: input.values.infillPercent,
    wallLoops: input.values.wallLoops,
    notes: input.values.notes,
    isFavorite: input.editingPrintProfile?.isFavorite ?? false,
    isActive: input.editingPrintProfile?.isActive ?? true,
    createdAt: input.editingPrintProfile?.createdAt ?? now,
    updatedAt: now,
  }
}

export function createDuplicatedPrintProfile(printProfile: PrintProfile): PrintProfile {
  const now = createTimestamp()

  return {
    ...printProfile,
    id: createEntityId(),
    name: `${printProfile.name} cópia`,
    isFavorite: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyPrintProfileChanges(
  printProfile: PrintProfile,
  changes: Partial<PrintProfile>,
): PrintProfile {
  return {
    ...printProfile,
    ...changes,
    updatedAt: createTimestamp(),
  }
}
