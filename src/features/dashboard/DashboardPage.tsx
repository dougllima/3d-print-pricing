import { Calculator, Cuboid, History, Layers3, Package, Printer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { CostCalculation, Material, Printer as PrinterType, PrintProfile, Product } from '@/shared/types'

type DashboardData = {
  calculations: CostCalculation[]
  materials: Material[]
  printers: PrinterType[]
  printProfiles: PrintProfile[]
  products: Product[]
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

const emptyDashboardData: DashboardData = {
  calculations: [],
  materials: [],
  printers: [],
  printProfiles: [],
  products: [],
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
    ])
      .then(([materials, printers, products, printProfiles, calculations]) => {
        if (shouldUpdate) {
          setData({ calculations, materials, printers, printProfiles, products })
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
    repositories.products,
  ])

  const latestCalculation = useMemo(
    () =>
      data.calculations.toSorted(
        (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
      )[0],
    [data.calculations],
  )

  const metrics = [
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

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <p className="text-sm font-medium text-[#1f7a78]">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Visão geral do MVP</h1>
      </header>

      <section className="grid gap-4 px-5 md:grid-cols-4 md:px-8">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <article className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm" key={metric.label}>
              <Icon className="h-5 w-5 text-[#1f7a78]" aria-hidden="true" />
              <p className="mt-3 text-sm text-[#697782]">{metric.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[#17202a]">{metric.value}</p>
            </article>
          )
        })}
      </section>

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
              <p className="mt-2">Custo total: {currencyFormatter.format(latestCalculation.result.totalCost)}</p>
              <p>Preço sugerido: {currencyFormatter.format(latestCalculation.result.suggestedPrice)}</p>
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
