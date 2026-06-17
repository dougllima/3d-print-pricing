import { ArrowDown, ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type {
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  PrintQueueItem,
  Product,
} from '@/shared/types'
import { defaultSettings } from '@/shared/types'
import { formatCurrency, formatMinutes } from '@/shared/utils'
import { createTimestamp } from '@/shared/utils'

import { createPrintQueueItemSummary } from './printQueueSummary'

const statusLabels: Record<PrintQueueItem['status'], string> = {
  canceled: 'Cancelada',
  finished: 'Finalizada',
  queued: 'Na fila',
  started: 'Iniciada',
}

function sortQueueItems(items: PrintQueueItem[]) {
  return items.toSorted((first, second) => first.position - second.position)
}

function formatOptionalCurrency(value: number | undefined) {
  return value === undefined ? '-' : formatCurrency(value)
}

function formatOptionalText(value: string | undefined) {
  return value === undefined ? '-' : value
}

export function PrintQueuePage() {
  const repositories = useRepositories()
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [printProfiles, setPrintProfiles] = useState<PrintProfile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [queueItems, setQueueItems] = useState<PrintQueueItem[]>([])
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings)

  const loadQueueData = useCallback(async () => {
    const [
      savedMaterials,
      savedPrinters,
      savedProducts,
      savedPrintProfiles,
      savedQueueItems,
      savedSettings,
    ] = await Promise.all([
      repositories.materials.list(),
      repositories.printers.list(),
      repositories.products.list(),
      repositories.printProfiles.list(),
      repositories.printQueue.list(),
      repositories.settings.get(),
    ])

    setMaterials(savedMaterials)
    setPrinters(savedPrinters)
    setProducts(savedProducts)
    setPrintProfiles(savedPrintProfiles)
    setQueueItems(sortQueueItems(savedQueueItems))
    setSettings(savedSettings)
  }, [
    repositories.materials,
    repositories.printers,
    repositories.printProfiles,
    repositories.printQueue,
    repositories.products,
    repositories.settings,
  ])

  useEffect(() => {
    let shouldUpdate = true

    Promise.all([
      repositories.materials.list(),
      repositories.printers.list(),
      repositories.products.list(),
      repositories.printProfiles.list(),
      repositories.printQueue.list(),
      repositories.settings.get(),
    ])
      .then(
        ([
          savedMaterials,
          savedPrinters,
          savedProducts,
          savedPrintProfiles,
          savedQueueItems,
          savedSettings,
        ]) => {
          if (shouldUpdate) {
            setMaterials(savedMaterials)
            setPrinters(savedPrinters)
            setProducts(savedProducts)
            setPrintProfiles(savedPrintProfiles)
            setQueueItems(sortQueueItems(savedQueueItems))
            setSettings(savedSettings)
          }
        },
      )
      .catch(() => {
        if (shouldUpdate) {
          setMaterials([])
          setPrinters([])
          setProducts([])
          setPrintProfiles([])
          setQueueItems([])
          setSettings(defaultSettings)
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [
    repositories.materials,
    repositories.printers,
    repositories.printProfiles,
    repositories.printQueue,
    repositories.products,
    repositories.settings,
  ])

  const activeQueueItems = useMemo(
    () => sortQueueItems(queueItems.filter((queueItem) => queueItem.isActive)),
    [queueItems],
  )

  async function moveQueueItem(item: PrintQueueItem, direction: -1 | 1) {
    const currentIndex = activeQueueItems.findIndex((queueItem) => queueItem.id === item.id)
    const targetItem = activeQueueItems[currentIndex + direction]

    if (targetItem === undefined) {
      return
    }

    const now = createTimestamp()

    await repositories.printQueue.save({
      ...item,
      position: targetItem.position,
      updatedAt: now,
    })
    await repositories.printQueue.save({
      ...targetItem,
      position: item.position,
      updatedAt: now,
    })
    await loadQueueData()
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Fila</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Fila de impressão</h1>
          </div>
          <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
            {activeQueueItems.length} item(ns) na fila
          </div>
        </div>
      </header>

      <div className="px-5 pb-6 md:px-8">
        {activeQueueItems.length === 0 ? (
          <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
            Nenhuma impressão na fila.
          </section>
        ) : (
          <section className="overflow-x-auto rounded-md border border-[#d8dee2] bg-white shadow-sm">
            <table className="min-w-[64rem] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[#d8dee2] bg-[#fbfcfd] text-xs uppercase text-[#697782]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ordem</th>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Filamentos</th>
                  <th className="px-4 py-3 font-semibold">Plates</th>
                  <th className="px-4 py-3 font-semibold">Tempo</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Preço</th>
                  <th className="px-4 py-3 font-semibold">Prazo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f3]">
                {activeQueueItems.map((item, index) => {
                  const summary = createPrintQueueItemSummary({
                    item,
                    materials,
                    printers,
                    printProfiles,
                    products,
                    settings,
                  })

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#17202a]">{index + 1}</span>
                          <div className="flex gap-1">
                            <button
                              aria-label="Mover para cima"
                              className="rounded-md border border-[#cfd7dc] p-1 text-[#52616b] disabled:opacity-40"
                              disabled={index === 0}
                              onClick={() => void moveQueueItem(item, -1)}
                              type="button"
                            >
                              <ArrowUp className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              aria-label="Mover para baixo"
                              className="rounded-md border border-[#cfd7dc] p-1 text-[#52616b] disabled:opacity-40"
                              disabled={index === activeQueueItems.length - 1}
                              onClick={() => void moveQueueItem(item, 1)}
                              type="button"
                            >
                              <ArrowDown className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-[#17202a]">{summary.productName}</div>
                        <div className="mt-1 text-xs text-[#697782]">
                          {summary.printProfile?.name ?? 'Impressão não encontrada'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {summary.filamentNames.length === 0
                          ? '-'
                          : summary.filamentNames.join(', ')}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">{summary.plateCount}</td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {formatMinutes(summary.totalPrintTimeMinutes)}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {formatOptionalText(item.clientName)}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {formatOptionalCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {formatOptionalText(item.deadline)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                          {statusLabels[item.status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}
