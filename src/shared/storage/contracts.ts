import type {
  CostCalculation,
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  Product,
} from '@/shared/types'

export type Entity = {
  id: string
}

export type EntityRepository<TEntity extends Entity> = {
  list: () => Promise<TEntity[]>
  getById: (id: string) => Promise<TEntity | undefined>
  save: (entity: TEntity) => Promise<TEntity>
  saveMany: (entities: TEntity[]) => Promise<TEntity[]>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
}

export type SettingsRepository = {
  get: () => Promise<GlobalSettings>
  save: (settings: GlobalSettings) => Promise<GlobalSettings>
  reset: () => Promise<GlobalSettings>
}

export type AppRepositories = {
  materials: EntityRepository<Material>
  printers: EntityRepository<Printer>
  products: EntityRepository<Product>
  printProfiles: EntityRepository<PrintProfile>
  settings: SettingsRepository
  costCalculations: EntityRepository<CostCalculation>
}
