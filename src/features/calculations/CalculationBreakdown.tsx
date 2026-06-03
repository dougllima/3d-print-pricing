import type { CostCalculation, GlobalSettings } from '@/shared/types'

type CalculationBreakdownProps = {
  result?: CostCalculation['result']
  settings: GlobalSettings
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

export function CalculationBreakdown({ result, settings }: CalculationBreakdownProps) {
  if (result === undefined) {
    return (
      <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
        Preencha os dados e calcule para ver o detalhamento.
      </section>
    )
  }

  const minimumPriceWarning =
    settings.defaultMinimumPrice !== undefined && result.suggestedPrice < settings.defaultMinimumPrice

  return (
    <section className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#17202a]">Detalhamento de custos</h2>

      <dl className="mt-4 grid gap-3 text-sm text-[#52616b] sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-[#697782]">Material</dt>
          <dd>{formatCurrency(result.materialCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Energia</dt>
          <dd>{formatCurrency(result.energyCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Máquina</dt>
          <dd>{formatCurrency(result.machineCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Manutenção</dt>
          <dd>{formatCurrency(result.maintenanceCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Custo de impressão</dt>
          <dd>{formatCurrency(result.printingCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Custo de acabamento</dt>
          <dd>{formatCurrency(result.finishingCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Reserva de falha</dt>
          <dd>{formatCurrency(result.failureReserveCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Custo total</dt>
          <dd>{formatCurrency(result.totalCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Peso total</dt>
          <dd>{result.totalWeightGrams.toFixed(2)} g</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[#697782]">Desperdício</dt>
          <dd>
            {result.wasteWeightGrams.toFixed(2)} g ({formatPercent(result.wastePercent)})
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-md bg-[#dcebed] p-4">
        <p className="text-sm text-[#163b45]">Preço sugerido</p>
        <p className="mt-1 text-3xl font-semibold text-[#163b45]">
          {formatCurrency(result.suggestedPrice)}
        </p>
        <p className="mt-2 text-sm text-[#52616b]">
          Lucro estimado: {formatCurrency(result.estimatedProfit)} | Margem real:{' '}
          {formatPercent(result.realMarginPercent)}
        </p>
      </div>

      {minimumPriceWarning && (
        <p className="mt-4 rounded-md border border-[#f3c88b] bg-[#fff7ed] px-3 py-2 text-sm text-[#9a5b25]">
          O preço sugerido está abaixo do preço mínimo configurado.
        </p>
      )}
    </section>
  )
}
