import { describe, expect, it } from 'vitest'

import type { PrintProfile } from '@/shared/types'

import {
  applyPrintProfileChanges,
  createDuplicatedPrintProfile,
  createPrintProfileFromFormValues,
} from './printProfileService'

const now = '2026-06-07T10:00:00.000Z'

const basePrintProfile: PrintProfile = {
  id: 'profile-1',
  name: 'Chaveiro',
  printerId: 'printer-1',
  printRuns: [],
  isFavorite: true,
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

describe('printProfileService', () => {
  it('creates domain print profiles from form values', () => {
    const printProfile = createPrintProfileFromFormValues({
      values: {
        productId: 'product-1',
        name: 'Chaveiro - 10 unidades',
        printerId: 'printer-1',
        printRuns: [
          {
            id: 'run-1',
            quantity: 10,
            printTimeHours: 2,
            printTimeMinutesPart: 30,
            materials: [
              {
                id: 'usage-1',
                materialId: 'material-1',
                modelWeightGrams: 80,
                supportWeightGrams: 0,
                purgeWeightGrams: 5,
                otherWasteGrams: 0,
              },
            ],
          },
        ],
        slicerProfileName: undefined,
        layerHeightMm: undefined,
        nozzleDiameterMm: undefined,
        infillPercent: undefined,
        wallLoops: undefined,
        notes: undefined,
      },
    })

    expect(printProfile.productId).toBe('product-1')
    expect(printProfile.printRuns[0]?.printTimeMinutes).toBe(150)
    expect(printProfile.isFavorite).toBe(false)
    expect(printProfile.isActive).toBe(true)
  })

  it('keeps duplication and updates predictable', () => {
    const duplicatedPrintProfile = createDuplicatedPrintProfile(basePrintProfile)
    const archivedPrintProfile = applyPrintProfileChanges(basePrintProfile, { isActive: false })

    expect(duplicatedPrintProfile.id).not.toBe(basePrintProfile.id)
    expect(duplicatedPrintProfile.name).toBe('Chaveiro cópia')
    expect(duplicatedPrintProfile.isFavorite).toBe(false)
    expect(archivedPrintProfile.isActive).toBe(false)
    expect(archivedPrintProfile.id).toBe(basePrintProfile.id)
  })
})
