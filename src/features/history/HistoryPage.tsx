import type { CostCalculation } from '@/shared/types'
import { useRepositories } from '@/app/useRepositories'
import { useEffect, useState } from 'react'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

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
          <div className="space-y-4">
            {calculations.map((calculation) => (
              <article className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm" key={calculation.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#17202a]">{calculation.name}</h2>
                    <p className="mt-1 text-sm text-[#52616b]">
                      {new Date(calculation.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-sm text-[#52616b] md:text-right">
                    <p>Custo: {currencyFormatter.format(calculation.result.totalCost)}</p>
                    <p>Preço: {currencyFormatter.format(calculation.result.suggestedPrice)}</p>
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-sm text-[#52616b] sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Material</dt>
                    <dd>{calculation.snapshot.materialName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Impressora</dt>
                    <dd>{calculation.snapshot.printerName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-[#697782]">Margem</dt>
                    <dd>{calculation.snapshot.profitMarginPercent}%</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
