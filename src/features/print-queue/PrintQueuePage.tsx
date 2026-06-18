import { ArrowDown, ArrowUp, CheckCircle2, Pencil, Play, Save, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import { CurrencyInput } from '@/shared/components'
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
import {
  finishPrintQueueItem,
  startPrintQueueItem,
  updatePrintQueueItemDetails,
} from './printQueueService'

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

type QueueItemDetailsDraft = {
  clientName: string
  deadline: string
  price: number | undefined
}

const tableInputClassName =
  'w-full min-w-32 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]'

export function PrintQueuePage() {
  const repositories = useRepositories()
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [printProfiles, setPrintProfiles] = useState<PrintProfile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [queueItems, setQueueItems] = useState<PrintQueueItem[]>([])
  const [queueMessage, setQueueMessage] = useState<string | undefined>()
  const [editingItemId, setEditingItemId] = useState<string | undefined>()
  const [detailsDraft, setDetailsDraft] = useState<QueueItemDetailsDraft>({
    clientName: '',
    deadline: '',
    price: undefined,
  })
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

  async function startItem(item: PrintQueueItem) {
    const result = startPrintQueueItem({
      item,
      materials,
      printProfiles,
    })

    if (!result.success) {
      setQueueMessage(result.message)
      return
    }

    await repositories.materials.saveMany(result.materials)
    await repositories.printQueue.save(result.item)
    setQueueMessage('Impressão iniciada e estoque atualizado.')
    await loadQueueData()
  }

  async function finishItem(item: PrintQueueItem) {
    const result = finishPrintQueueItem({ item })

    if (!result.success) {
      setQueueMessage(result.message)
      return
    }

    await repositories.printQueue.save(result.item)
    setQueueMessage('Impressão finalizada.')
    await loadQueueData()
  }

  function startEditingDetails(item: PrintQueueItem) {
    setEditingItemId(item.id)
    setDetailsDraft({
      clientName: item.clientName ?? '',
      deadline: item.deadline ?? '',
      price: item.price,
    })
  }

  function cancelEditingDetails() {
    setEditingItemId(undefined)
    setDetailsDraft({
      clientName: '',
      deadline: '',
      price: undefined,
    })
  }

  async function saveItemDetails(item: PrintQueueItem) {
    await repositories.printQueue.save(
      updatePrintQueueItemDetails({
        item,
        values: detailsDraft,
      }),
    )
    setQueueMessage('Dados da fila atualizados.')
    cancelEditingDetails()
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
          <div className="flex flex-wrap gap-2">
            <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
              {activeQueueItems.length} item(ns) na fila
            </div>
            {queueMessage && (
              <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
                {queueMessage}
              </div>
            )}
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
            <table className="min-w-[72rem] w-full border-collapse text-left text-sm">
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
                  <th className="px-4 py-3 font-semibold">Ações</th>
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
                        {editingItemId === item.id ? (
                          <input
                            className={tableInputClassName}
                            onChange={(event) =>
                              setDetailsDraft((currentDraft) => ({
                                ...currentDraft,
                                clientName: event.target.value,
                              }))
                            }
                            placeholder="Cliente"
                            value={detailsDraft.clientName}
                          />
                        ) : (
                          formatOptionalText(item.clientName)
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {editingItemId === item.id ? (
                          <CurrencyInput
                            className={tableInputClassName}
                            onChange={(price) =>
                              setDetailsDraft((currentDraft) => ({
                                ...currentDraft,
                                price,
                              }))
                            }
                            placeholder="R$ 120,00"
                            value={detailsDraft.price}
                          />
                        ) : (
                          formatOptionalCurrency(item.price)
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-[#52616b]">
                        {editingItemId === item.id ? (
                          <input
                            className={tableInputClassName}
                            onChange={(event) =>
                              setDetailsDraft((currentDraft) => ({
                                ...currentDraft,
                                deadline: event.target.value,
                              }))
                            }
                            type="date"
                            value={detailsDraft.deadline}
                          />
                        ) : (
                          formatOptionalText(item.deadline)
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          {editingItemId === item.id ? (
                            <>
                              <button
                                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                                onClick={() => void saveItemDetails(item)}
                                type="button"
                              >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                Salvar
                              </button>
                              <button
                                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                                onClick={cancelEditingDetails}
                                type="button"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                              onClick={() => startEditingDetails(item)}
                              type="button"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Editar
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={item.status !== 'queued'}
                            onClick={() => void startItem(item)}
                            type="button"
                          >
                            <Play className="h-4 w-4" aria-hidden="true" />
                            Iniciar
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={item.status !== 'started'}
                            onClick={() => void finishItem(item)}
                            type="button"
                          >
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Finalizar
                          </button>
                        </div>
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
