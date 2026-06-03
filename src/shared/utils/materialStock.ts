import type { Material } from '@/shared/types'

export type MaterialStockStatus = 'not-tracked' | 'available' | 'low' | 'empty'

export function getMaterialStockStatus(material: Material): MaterialStockStatus {
  if (material.remainingWeightGrams === undefined) {
    return 'not-tracked'
  }

  if (material.remainingWeightGrams === 0) {
    return 'empty'
  }

  if (
    material.lowStockThresholdGrams !== undefined &&
    material.remainingWeightGrams <= material.lowStockThresholdGrams
  ) {
    return 'low'
  }

  return 'available'
}

export function isMaterialLowStock(material: Material) {
  const status = getMaterialStockStatus(material)

  return status === 'low' || status === 'empty'
}

export function hasEnoughMaterialStock(material: Material, requiredWeightGrams: number) {
  return (
    material.remainingWeightGrams === undefined ||
    requiredWeightGrams <= material.remainingWeightGrams
  )
}
