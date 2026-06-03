import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { Material } from '@/shared/types'

import { MaterialForm } from './MaterialForm'
import { MaterialList } from './MaterialList'
import type { MaterialFormValues } from './materialFormSchema'

function createMaterialId() {
  return crypto.randomUUID()
}

function createTimestamp() {
  return new Date().toISOString()
}

export function MaterialsPage() {
  const repositories = useRepositories()
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>()
  const [materials, setMaterials] = useState<Material[]>([])

  const loadMaterials = useCallback(async () => {
    const savedMaterials = await repositories.materials.list()

    setMaterials(savedMaterials.toSorted((first, second) => first.name.localeCompare(second.name)))
  }, [repositories.materials])

  useEffect(() => {
    let shouldUpdate = true

    repositories.materials
      .list()
      .then((savedMaterials) => {
        if (shouldUpdate) {
          setMaterials(
            savedMaterials.toSorted((first, second) => first.name.localeCompare(second.name)),
          )
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setMaterials([])
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [repositories.materials])

  const activeMaterialsCount = useMemo(
    () => materials.filter((material) => material.isActive).length,
    [materials],
  )

  async function saveMaterial(values: MaterialFormValues) {
    const now = createTimestamp()
    const material: Material = {
      id: editingMaterial?.id ?? createMaterialId(),
      name: values.name,
      type: values.type,
      brand: values.brand,
      colorName: values.colorName,
      colorHex: values.colorHex,
      supplierColorCode: values.supplierColorCode,
      pricePerKg: values.pricePerKg,
      notes: values.notes,
      isActive: editingMaterial?.isActive ?? true,
      createdAt: editingMaterial?.createdAt ?? now,
      updatedAt: now,
    }

    await repositories.materials.save(material)
    setEditingMaterial(undefined)
    await loadMaterials()
  }

  async function updateMaterialStatus(material: Material, isActive: boolean) {
    await repositories.materials.save({
      ...material,
      isActive,
      updatedAt: createTimestamp(),
    })
    await loadMaterials()
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Materiais</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Catálogo de filamentos</h1>
          </div>
          <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
            {activeMaterialsCount} ativos de {materials.length} cadastrados
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 lg:grid-cols-[minmax(24rem,28rem)_minmax(0,1fr)]">
        <MaterialForm
          material={editingMaterial}
          onCancelEdit={() => setEditingMaterial(undefined)}
          onSubmit={saveMaterial}
        />
        <MaterialList
          materials={materials}
          onArchive={(material) => updateMaterialStatus(material, false)}
          onEdit={setEditingMaterial}
          onRestore={(material) => updateMaterialStatus(material, true)}
        />
      </div>
    </div>
  )
}
