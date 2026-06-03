import { Archive, Copy, Pencil, RotateCcw, Star } from 'lucide-react'

import { calculateCost } from '@/features/calculations'
import type { GlobalSettings, Material, Printer, PrintProfile, Product } from '@/shared/types'
import { cn, hasEnoughMaterialStock } from '@/shared/utils'

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
  settings: GlobalSettings
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

function findById<TItem extends { id: string }>(items: TItem[], id?: string) {
  if (id === undefined) {
    return undefined
  }

  return items.find((item) => item.id === id)
}

function findName<TItem extends { id: string; name: string }>(items: TItem[], id?: string) {
  if (id === undefined) {
    return 'Avulsa'
  }

  return items.find((item) => item.id === id)?.name ?? 'Não encontrado'
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes.toString().padStart(2, '0')}min`
}

function getRunTotalWeight(printRun: PrintProfile['printRuns'][number]) {
  return printRun.materials.reduce(
    (totalWeight, materialUsage) =>
      totalWeight +
      materialUsage.modelWeightGrams +
      materialUsage.supportWeightGrams +
      materialUsage.purgeWeightGrams +
      materialUsage.otherWasteGrams,
    0,
  )
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
  settings,
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
        {printProfiles.map((printProfile) => {
          const printer = findById(printers, printProfile.printerId)

          return (
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
                    <dt className="text-xs uppercase text-[#697782]">Variações</dt>
                    <dd>{printProfile.printRuns.length} quantidade(s)</dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-3">
                  {printProfile.printRuns.map((printRun) => {
                    const materialUsages = printRun.materials.map((materialUsage) => {
                      const material = findById(materials, materialUsage.materialId)

                      return {
                        ...materialUsage,
                        material,
                      }
                    })
                    const missingMaterial = materialUsages.some(
                      (materialUsage) => materialUsage.material === undefined,
                    )
                    const result =
                      printer === undefined || missingMaterial
                        ? undefined
                        : calculateCost({
                            materialUsages: materialUsages.map((materialUsage) => ({
                              materialPricePerKg: materialUsage.material?.pricePerKg ?? 0,
                              modelWeightGrams: materialUsage.modelWeightGrams,
                              supportWeightGrams: materialUsage.supportWeightGrams,
                              purgeWeightGrams: materialUsage.purgeWeightGrams,
                              otherWasteGrams: materialUsage.otherWasteGrams,
                            })),
                            printerPowerWatts: printer.powerWatts,
                            electricityCostPerKwh: settings.electricityCostPerKwh,
                            printerPurchasePrice: printer.purchasePrice,
                            printerEstimatedLifetimeHours: printer.estimatedLifetimeHours,
                            printerMaintenanceCostPerHour: printer.maintenanceCostPerHour,
                            printTimeMinutes: printRun.printTimeMinutes,
                            modelWeightGrams: 0,
                            quantity: printRun.quantity,
                            finishingTasks: [],
                            failureRatePercent:
                              printer.defaultFailureRatePercent ??
                              settings.defaultFailureRatePercent,
                            profitMarginPercent: settings.defaultProfitMarginPercent,
                          })
                    const stockWarnings = materialUsages.filter(
                      (materialUsage) =>
                        materialUsage.material !== undefined &&
                        !hasEnoughMaterialStock(
                          materialUsage.material,
                          materialUsage.modelWeightGrams +
                            materialUsage.supportWeightGrams +
                            materialUsage.purgeWeightGrams +
                            materialUsage.otherWasteGrams,
                        ),
                    )

                    return (
                      <div
                        className="rounded-md border border-[#edf1f3] bg-[#fbfcfd] p-3"
                        key={printRun.id}
                      >
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#52616b]">
                          <span className="font-medium text-[#17202a]">
                            {printRun.quantity} unidade(s)
                          </span>
                          <span>Tempo: {formatMinutes(printRun.printTimeMinutes)}</span>
                          <span>Peso: {getRunTotalWeight(printRun).toFixed(1)} g</span>
                        </div>
                        {result !== undefined && (
                          <div className="mt-2 grid gap-2 text-sm text-[#52616b] sm:grid-cols-2">
                            <span>Custo: {currencyFormatter.format(result.totalCost)}</span>
                            <span>
                              Preço sugerido:{' '}
                              {currencyFormatter.format(result.suggestedPrice)}
                            </span>
                          </div>
                        )}
                        <ul className="mt-2 space-y-1 text-xs text-[#697782]">
                          {materialUsages.map((materialUsage) => (
                            <li key={materialUsage.id}>
                              {materialUsage.material?.name ?? 'Material não encontrado'}:{' '}
                              {(
                                materialUsage.modelWeightGrams +
                                materialUsage.supportWeightGrams +
                                materialUsage.purgeWeightGrams +
                                materialUsage.otherWasteGrams
                              ).toFixed(1)}{' '}
                              g
                            </li>
                          ))}
                        </ul>
                        {stockWarnings.length > 0 && (
                          <p className="mt-2 rounded-md border border-[#e5c76b] bg-[#fff8db] px-3 py-2 text-xs text-[#8a6100]">
                            Uma ou mais cores passam do estoque restante.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

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
          )
        })}
      </div>
    </section>
  )
}
