import { Archive, Pencil, RotateCcw } from 'lucide-react'

import type { Material } from '@/shared/types'
import { getMaterialStockStatus } from '@/shared/utils'

type MaterialListProps = {
  materials: Material[]
  onArchive: (material: Material) => Promise<void>
  onEdit: (material: Material) => void
  onRestore: (material: Material) => Promise<void>
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

const stockStatusLabels = {
  'not-tracked': 'Sem controle',
  available: 'Estoque ok',
  low: 'Estoque baixo',
  empty: 'Sem estoque',
} as const

const stockStatusClasses = {
  'not-tracked': 'bg-[#e8eef0] text-[#52616b]',
  available: 'bg-[#e4f3ec] text-[#28704f]',
  low: 'bg-[#fff0c2] text-[#8a6100]',
  empty: 'bg-[#fde8e4] text-[#b42318]',
} as const

function formatWeight(weightGrams: number | undefined) {
  return weightGrams === undefined ? '-' : `${weightFormatter.format(weightGrams)} g`
}

export function MaterialList({ materials, onArchive, onEdit, onRestore }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
        Nenhum material cadastrado.
      </section>
    )
  }

  return (
    <section className="rounded-md border border-[#d8dee2] bg-white shadow-sm">
      <div className="border-b border-[#d8dee2] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#17202a]">Materiais cadastrados</h2>
      </div>
      <div className="divide-y divide-[#edf1f3]">
        {materials.map((material) => {
          const stockStatus = getMaterialStockStatus(material)

          return (
            <article
              className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
              key={material.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-[#cfd7dc]"
                    style={{ backgroundColor: material.colorHex ?? '#ffffff' }}
                  />
                  <h3 className="font-semibold text-[#17202a]">{material.name}</h3>
                  <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                    {material.type}
                  </span>
                  <span className="rounded-md bg-[#f3e7d7] px-2 py-1 text-xs font-medium text-[#9a5b25]">
                    {material.isActive ? 'Ativo' : 'Arquivado'}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${stockStatusClasses[stockStatus]}`}
                  >
                    {stockStatusLabels[stockStatus]}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-[#52616b] sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Preço por kg</dt>
                    <dd>{currencyFormatter.format(material.pricePerKg)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Marca</dt>
                    <dd>{material.brand ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Cor</dt>
                    <dd>{material.colorName ?? material.colorHex ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Código</dt>
                    <dd>{material.supplierColorCode ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Rolo</dt>
                    <dd>{formatWeight(material.spoolWeightGrams)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Restante</dt>
                    <dd>{formatWeight(material.remainingWeightGrams)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Alerta</dt>
                    <dd>{formatWeight(material.lowStockThresholdGrams)}</dd>
                  </div>
                </dl>
                {material.notes && <p className="mt-3 text-sm text-[#52616b]">{material.notes}</p>}
              </div>

              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() => onEdit(material)}
                  type="button"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar
                </button>
                {material.isActive ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                    onClick={() => void onArchive(material)}
                    type="button"
                  >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    Arquivar
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                    onClick={() => void onRestore(material)}
                    type="button"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reativar
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
