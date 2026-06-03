import { Archive, Copy, Pencil, RotateCcw, Star } from 'lucide-react'

import type { Material, Printer, PrintProfile, Product } from '@/shared/types'
import { cn } from '@/shared/utils'

type PrintProfileListProps = {
  materials: Material[]
  onArchive: (printProfile: PrintProfile) => Promise<void>
  onDuplicate: (printProfile: PrintProfile) => Promise<void>
  onEdit: (printProfile: PrintProfile) => void
  onRestore: (printProfile: PrintProfile) => Promise<void>
  onToggleFavorite: (printProfile: PrintProfile) => Promise<void>
  printers: Printer[]
  printProfiles: PrintProfile[]
  products: Product[]
}

function findName<TItem extends { id: string; name: string }>(items: TItem[], id?: string) {
  if (id === undefined) {
    return 'Avulsa'
  }

  return items.find((item) => item.id === id)?.name ?? 'Não encontrado'
}

export function PrintProfileList({
  materials,
  onArchive,
  onDuplicate,
  onEdit,
  onRestore,
  onToggleFavorite,
  printers,
  printProfiles,
  products,
}: PrintProfileListProps) {
  if (printProfiles.length === 0) {
    return (
      <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
        Nenhuma impressão cadastrada.
      </section>
    )
  }

  return (
    <section className="rounded-md border border-[#d8dee2] bg-white shadow-sm">
      <div className="border-b border-[#d8dee2] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#17202a]">Impressões cadastradas</h2>
      </div>
      <div className="divide-y divide-[#edf1f3]">
        {printProfiles.map((printProfile) => (
          <article
            className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
            key={printProfile.id}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#17202a]">{printProfile.name}</h3>
                <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                  {findName(products, printProfile.productId)}
                </span>
                <span className="rounded-md bg-[#f3e7d7] px-2 py-1 text-xs font-medium text-[#9a5b25]">
                  {printProfile.isActive ? 'Ativa' : 'Arquivada'}
                </span>
                {printProfile.isFavorite && (
                  <span className="rounded-md bg-[#dcebed] px-2 py-1 text-xs font-medium text-[#163b45]">
                    Favorita
                  </span>
                )}
              </div>

              <dl className="mt-3 grid gap-2 text-sm text-[#52616b] sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Impressora</dt>
                  <dd>{findName(printers, printProfile.printerId)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Material</dt>
                  <dd>{findName(materials, printProfile.materialId)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Tempo</dt>
                  <dd>{printProfile.printTimeHours} h</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Peso total</dt>
                  <dd>
                    {printProfile.modelWeightGrams +
                      printProfile.supportWeightGrams +
                      printProfile.purgeWeightGrams +
                      printProfile.otherWasteGrams}{' '}
                    g
                  </dd>
                </div>
              </dl>

              {printProfile.notes && (
                <p className="mt-3 text-sm text-[#52616b]">{printProfile.notes}</p>
              )}
            </div>

            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <button
                className={cn(
                  'inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]',
                  printProfile.isFavorite && 'border-[#1f7a78] text-[#163b45]',
                )}
                onClick={() => void onToggleFavorite(printProfile)}
                type="button"
              >
                <Star className="h-4 w-4" aria-hidden="true" />
                Favorita
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                onClick={() => onEdit(printProfile)}
                type="button"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                onClick={() => void onDuplicate(printProfile)}
                type="button"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Duplicar
              </button>
              {printProfile.isActive ? (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() => void onArchive(printProfile)}
                  type="button"
                >
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  Arquivar
                </button>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() => void onRestore(printProfile)}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reativar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
