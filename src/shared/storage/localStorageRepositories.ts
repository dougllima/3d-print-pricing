import { STORAGE_KEYS } from '@/shared/constants'
import {
  costCalculationSchema,
  globalSettingsSchema,
  materialSchema,
  printerSchema,
  printProfileSchema,
  printQueueItemSchema,
  productSchema,
} from '@/shared/types'

import type { AppRepositories } from './contracts'
import { LocalStorageEntityRepository, type StorageLike } from './localStorageRepository'
import { LocalStorageSettingsRepository } from './localStorageSettingsRepository'

export function createLocalStorageRepositories(storage: StorageLike): AppRepositories {
  return {
    materials: new LocalStorageEntityRepository(storage, STORAGE_KEYS.materials, materialSchema),
    printers: new LocalStorageEntityRepository(storage, STORAGE_KEYS.printers, printerSchema),
    products: new LocalStorageEntityRepository(storage, STORAGE_KEYS.products, productSchema),
    printProfiles: new LocalStorageEntityRepository(
      storage,
      STORAGE_KEYS.printProfiles,
      printProfileSchema,
    ),
    printQueue: new LocalStorageEntityRepository(
      storage,
      STORAGE_KEYS.printQueue,
      printQueueItemSchema,
    ),
    settings: new LocalStorageSettingsRepository(storage, STORAGE_KEYS.settings, globalSettingsSchema),
    costCalculations: new LocalStorageEntityRepository(
      storage,
      STORAGE_KEYS.costCalculations,
      costCalculationSchema,
    ),
  }
}
