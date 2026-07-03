import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { CostCalculation } from '@/shared/types'
import { formatCurrency, formatMinutes, formatWeightGrams } from '@/shared/utils'

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function formatCalculationTime(printTimeHours: number) {
  return formatMinutes(Math.round(printTimeHours * 60))
}

function formatCalculationDate(createdAt: string) {
  return new Date(createdAt).toLocaleString('pt-BR')
}

export function HistoryPage() {
  const repositories = useRepositories()
  const [calculations, setCalculations] = useState<CostCalculation[]>([])

  useEffect(() => {
    let shouldUpdate = true

    repositories.costCalculations
      .list()
      .then((savedCalculations) => {
        if (shouldUpdate) {
          setCalculations(
            savedCalculations.toSorted(
              (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
            ),
          )
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setCalculations([])
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [repositories.costCalculations])

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <p className="text-sm font-medium text-[#1f7a78]">Histórico</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Cálculos salvos</h1>
      </header>

      <section className="px-5 pb-6 md:px-8">
        {calculations.length === 0 ? (
          <div className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
            Nenhum cálculo salvo.
          </div>
        ) : (
          <div className="space-y-3">
            {calculations.map((calculation) => (
              <details
                className="group overflow-hidden rounded-md border border-[#d8dee2] bg-white shadow-sm"
                key={calculation.id}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#17202a]">
                      {calculation.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#697782]">
                      {formatCalculationDate(calculation.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start gap-4">
                    <div className="text-right text-sm text-[#52616b]">
                      <p>Custo: {formatCurrency(calculation.result.totalCost)}</p>
                      <p className="font-medium text-[#163b45]">
                        Preço: {formatCurrency(calculation.result.suggestedPrice)}
                      </p>
                    </div>
                    <ChevronDown
                      className="mt-1 h-5 w-5 text-[#697782] transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </summary>

                <div className="border-t border-[#d8dee2] px-5 py-5">
                  <div className="grid gap-6 xl:grid-cols-3">
                    <section>
                      <h3 className="text-sm font-semibold text-[#17202a]">Dados da impressão</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[#52616b]">
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Quantidade</dt>
                          <dd>{calculation.input.quantity} un.</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Tempo</dt>
                          <dd>{formatCalculationTime(calculation.input.printTimeHours)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Modelo</dt>
                          <dd>{formatWeightGrams(calculation.input.modelWeightGrams)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Suportes</dt>
                          <dd>{formatWeightGrams(calculation.input.supportWeightGrams)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Purga</dt>
                          <dd>{formatWeightGrams(calculation.input.purgeWeightGrams)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Outras perdas</dt>
                          <dd>{formatWeightGrams(calculation.input.otherWasteGrams)}</dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-[#17202a]">Snapshot utilizado</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[#52616b]">
                        <div className="col-span-2">
                          <dt className="text-xs uppercase text-[#697782]">Materiais</dt>
                          <dd>{calculation.snapshot.materialName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Preço médio/kg</dt>
                          <dd>{formatCurrency(calculation.snapshot.materialPricePerKg)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Impressora</dt>
                          <dd>{calculation.snapshot.printerName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Energia/kWh</dt>
                          <dd>{formatCurrency(calculation.snapshot.electricityCostPerKwh)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Margem</dt>
                          <dd>{formatPercent(calculation.snapshot.profitMarginPercent)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Reserva de falha</dt>
                          <dd>{formatPercent(calculation.snapshot.failureRatePercent)}</dd>
                        </div>
                      </dl>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-[#17202a]">Composição do custo</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[#52616b]">
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Material</dt>
                          <dd>{formatCurrency(calculation.result.materialCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Energia</dt>
                          <dd>{formatCurrency(calculation.result.energyCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Máquina</dt>
                          <dd>{formatCurrency(calculation.result.machineCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Manutenção</dt>
                          <dd>{formatCurrency(calculation.result.maintenanceCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Acabamento</dt>
                          <dd>{formatCurrency(calculation.result.finishingCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Falhas</dt>
                          <dd>{formatCurrency(calculation.result.failureReserveCost)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Peso total</dt>
                          <dd>{formatWeightGrams(calculation.result.totalWeightGrams)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-[#697782]">Desperdício</dt>
                          <dd>
                            {formatWeightGrams(calculation.result.wasteWeightGrams)} ·{' '}
                            {formatPercent(calculation.result.wastePercent)}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>

                  {calculation.finishingTasks.length > 0 && (
                    <section className="mt-6 border-t border-[#edf1f3] pt-4">
                      <h3 className="text-sm font-semibold text-[#17202a]">Acabamentos</h3>
                      <ul className="mt-3 grid gap-2 text-sm text-[#52616b] md:grid-cols-2">
                        {calculation.finishingTasks.map((task) => (
                          <li className="flex justify-between gap-3" key={task.id}>
                            <span>{task.name}</span>
                            <span className="shrink-0">
                              {task.hours.toLocaleString('pt-BR')} h ·{' '}
                              {formatCurrency(task.hours * task.hourlyRate + task.materialCost)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
