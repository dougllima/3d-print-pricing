import type { ZodType } from 'zod'

import { defaultSettings, type GlobalSettings } from '@/shared/types'

import type { SettingsRepository } from './contracts'
import type { StorageLike } from './localStorageRepository'

export class LocalStorageSettingsRepository implements SettingsRepository {
  private readonly storage: StorageLike
  private readonly storageKey: string
  private readonly settingsSchema: ZodType<GlobalSettings>

  constructor(
    storage: StorageLike,
    storageKey: string,
    settingsSchema: ZodType<GlobalSettings>,
  ) {
    this.storage = storage
    this.storageKey = storageKey
    this.settingsSchema = settingsSchema
  }

  async get() {
    const storedValue = this.storage.getItem(this.storageKey)

    if (storedValue === null) {
      return this.save(defaultSettings)
    }

    return this.settingsSchema.parse(JSON.parse(storedValue))
  }

  async save(settings: GlobalSettings) {
    const parsedSettings = this.settingsSchema.parse(settings)

    this.storage.setItem(this.storageKey, JSON.stringify(parsedSettings))

    return parsedSettings
  }

  async reset() {
    return this.save(defaultSettings)
  }
}
