import type { ZodType } from 'zod'

import type { Entity, EntityRepository } from './contracts'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export class LocalStorageEntityRepository<TEntity extends Entity>
  implements EntityRepository<TEntity>
{
  private readonly storage: StorageLike
  private readonly storageKey: string
  private readonly entitySchema: ZodType<TEntity>

  constructor(
    storage: StorageLike,
    storageKey: string,
    entitySchema: ZodType<TEntity>,
  ) {
    this.storage = storage
    this.storageKey = storageKey
    this.entitySchema = entitySchema
  }

  async list() {
    return this.readAll()
  }

  async getById(id: string) {
    const entities = await this.readAll()

    return entities.find((entity) => entity.id === id)
  }

  async save(entity: TEntity) {
    const parsedEntity = this.entitySchema.parse(entity)
    const entities = await this.readAll()
    const existingIndex = entities.findIndex((currentEntity) => currentEntity.id === parsedEntity.id)

    if (existingIndex >= 0) {
      entities[existingIndex] = parsedEntity
    } else {
      entities.push(parsedEntity)
    }

    this.writeAll(entities)

    return parsedEntity
  }

  async saveMany(entities: TEntity[]) {
    const parsedEntities = entities.map((entity) => this.entitySchema.parse(entity))

    this.writeAll(parsedEntities)

    return parsedEntities
  }

  async remove(id: string) {
    const entities = await this.readAll()

    this.writeAll(entities.filter((entity) => entity.id !== id))
  }

  async clear() {
    this.storage.removeItem(this.storageKey)
  }

  private readAll() {
    const storedValue = this.storage.getItem(this.storageKey)

    if (storedValue === null) {
      return []
    }

    const unknownEntities: unknown = JSON.parse(storedValue)

    return this.entitySchema.array().parse(unknownEntities)
  }

  private writeAll(entities: TEntity[]) {
    this.storage.setItem(this.storageKey, JSON.stringify(entities))
  }
}
