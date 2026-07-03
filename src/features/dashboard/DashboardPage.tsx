import {
  AlertTriangle,
  Calculator,
  Clock3,
  Cuboid,
  History,
  Layers3,
  ListOrdered,
  Package,
  PlayCircle,
  Printer,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type {
  CostCalculation,
  Material,
  Printer as PrinterType,
  PrintProfile,
  PrintQueueItem,
  Product,
} from '@/shared/types'
import { formatMinutes, isMaterialLowStock } from '@/shared/utils'

import { createDashboardQueueSummary } from './dashboardQueueSummary'

type DashboardData = {
  calculations: CostCalculation[]
  materials: Material[]
  printers: PrinterType[]
  printProfiles: PrintProfile[]
  products: Product[]
  queueItems: PrintQueueItem[]
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

const weightFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

const emptyDashboardData: DashboardData = {
  calculations: [],
  materials: [],
  printers: [],
  printProfiles: [],
  products: [],
  queueItems: [],
}

const deadlineStatusClassNames = {
  overdue: 'bg-[#f6e4e1] text-[#9f2a1d]',
  today: 'bg-[#fff2cc] text-[#7a5300]',
  tomorrow: 'bg-[#e9f3ff] text-[#1f4f82]',
}

function formatWeight(weightGrams: number | undefined) {
  return weightGrams === undefined ? '-' : `${weightFormatter.format(weightGrams)} g`
}

export function DashboardPage() {
  const repositories = useRepositories()
  const [data, setData] = useState<DashboardData>(emptyDashboardData)

  useEffect(() => {
    let shouldUpdate = true

    Promise.all([
      repositories.materials.list(),
      repositories.printers.list(),
      repositories.products.list(),
      repositories.printProfiles.list(),
      repositories.costCalculations.list(),
      repositories.printQueue.list(),
    ])
      .then(([materials, printers, products, printProfiles, calculations, queueItems]) => {
        if (shouldUpdate) {
          setData({ calculations, materials, printers, printProfiles, products, queueItems })
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setData(emptyDashboardData)
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [
    repositories.costCalculations,
    repositories.materials,
    repositories.printers,
    repositories.printProfiles,
    repositories.printQueue,
    repositories.products,
  ])

  const latestCalculation = useMemo(
    () =>
      data.calculations.toSorted(
        (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
      )[0],
    [data.calculations],
  )

  const lowStockMaterials = useMemo(
    () =>
      data.materials
        .filter((material) => material.isActive && isMaterialLowStock(material))
        .toSorted(
          (first, second) =>
            (first.remainingWeightGrams ?? Number.POSITIVE_INFINITY) -
            (second.remainingWeightGrams ?? Number.POSITIVE_INFINITY),
        ),
    [data.materials],
  )

  const queueSummary = useMemo(
    () =>
      createDashboardQueueSummary({
        printProfiles: data.printProfiles,
        products: data.products,
        queueItems: data.queueItems,
      }),
    [data.printProfiles, data.products, data.queueItems],
  )

  const catalogMetrics = [
    {
      icon: Cuboid,
      label: 'Materiais ativos',
      value: data.materials.filter((material) => material.isActive).length,
    },
    {
      icon: Printer,
      label: 'Impressoras ativas',
      value: data.printers.filter((printer) => printer.isActive).length,
    },
    {
      icon: Package,
      label: 'Produtos ativos',
      value: data.products.filter((product) => product.isActive).length,
    },
    {
      icon: Layers3,
      label: 'Impressões ativas',
      value: data.printProfiles.filter((printProfile) => printProfile.isActive).length,
    },
  ]

  const queueMetrics = [
    { icon: ListOrdered, label: 'Aguardando', value: queueSummary.queuedCount },
    { icon: PlayCircle, label: 'Em andamento', value: queueSummary.startedCount },
    {
      icon: Clock3,
      label: 'Tempo pendente',
      value: formatMinutes(queueSummary.pendingPrintTimeMinutes),
    },
  ]

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <p className="text-sm font-medium text-[#1f7a78]">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Visão geral</h1>
      </header>

      <section className="grid gap-4 px-5 md:grid-cols-4 md:px-8">
        {catalogMetrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article
              className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm"
              key={metric.label}
            >
              <Icon className="h-5 w-5 text-[#1f7a78]" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#697782]">{metric.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#17202a]">{metric.value}</p>
            </article>
          )
        })}
      </section>

      <section className="px-5 md:px-8">
        <div className="overflow-hidden rounded-md border border-[#d8dee2] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8dee2] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#17202a]">Fila de impressão</h2>
            {queueSummary.overdueCount > 0 && (
              <span className="rounded-md bg-[#f6e4e1] px-2 py-1 text-xs font-medium text-[#9f2a1d]">
                {queueSummary.overdueCount} atrasada(s)
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-3">
            {queueMetrics.map((metric, index) => {
              const Icon = metric.icon

              return (
                <div
                  className={`px-5 py-4 ${index > 0 ? 'border-t border-[#edf1f3] md:border-l md:border-t-0' : ''}`}
                  key={metric.label}
                >
                  <div className="flex items-center gap-2 text-[#697782]">
                    <Icon className="h-4 w-4 text-[#1f7a78]" aria-hidden="true" />
                    <span className="text-sm">{metric.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-[#17202a]">{metric.value}</p>
                </div>
              )
            })}
          </div>

          {queueSummary.urgentItems.length > 0 && (
            <div className="border-t border-[#d8dee2] px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#8a6100]" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[#17202a]">
                  Prazos que precisam de atenção
                </h3>
              </div>
              <ul className="mt-3 grid gap-2 lg:grid-cols-2">
                {queueSummary.urgentItems.slice(0, 4).map((item) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-md border border-[#edf1f3] bg-[#fbfcfd] px-3 py-2 text-sm"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#17202a]">{item.productName}</p>
                      <p className="truncate text-xs text-[#697782]">{item.printProfileName}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${deadlineStatusClassNames[item.deadlineStatus]}`}
                      >
                        {item.statusLabel}
                      </span>
                      <p className="mt-1 text-xs text-[#697782]">{item.deadlineLabel}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {lowStockMaterials.length > 0 && (
        <section className="px-5 md:px-8">
          <article className="rounded-md border border-[#e5c76b] bg-[#fff8db] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#8a6100]" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-[#17202a]">Estoque baixo</h2>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-[#52616b] md:grid-cols-2">
              {lowStockMaterials.slice(0, 4).map((material) => (
                <li
                  className="rounded-md border border-[#efd886] bg-white px-3 py-2"
                  key={material.id}
                >
                  <span className="font-medium text-[#17202a]">{material.name}</span>
                  <span className="block">
                    Restante: {formatWeight(material.remainingWeightGrams)}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      <section className="grid gap-5 px-5 pb-6 md:px-8 lg:grid-cols-2">
        <article className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#1f7a78]" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-[#17202a]">Último cálculo</h2>
          </div>
          {latestCalculation === undefined ? (
            <p className="mt-4 text-sm text-[#52616b]">Nenhum cálculo salvo ainda.</p>
          ) : (
            <div className="mt-4 text-sm text-[#52616b]">
              <p className="font-medium text-[#17202a]">{latestCalculation.name}</p>
              <p className="mt-2">
                Custo total: {currencyFormatter.format(latestCalculation.result.totalCost)}
              </p>
              <p>
                Preço sugerido:{' '}
                {currencyFormatter.format(latestCalculation.result.suggestedPrice)}
              </p>
            </div>
          )}
        </article>

        <article className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#1f7a78]" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-[#17202a]">Histórico</h2>
          </div>
          <p className="mt-4 text-sm text-[#52616b]">
            {data.calculations.length} cálculo(s) salvo(s) como snapshot histórico.
          </p>
        </article>
      </section>
    </div>
  )
}
