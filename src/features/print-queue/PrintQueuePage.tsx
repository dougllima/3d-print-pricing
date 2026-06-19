import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Pencil,
  Play,
  Save,
  X,
} from 'lucide-react'
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

import {
  canReorderPrintQueueItem,
  countPrintQueueItemsByFilter,
  filterPrintQueueItems,
  printQueueFilterOptions,
  type PrintQueueFilter,
  sortPrintQueueItems,
} from './printQueueFilters'
import {
  createPrintQueueDeadlineInfo,
  type PrintQueueDeadlineStatus,
} from './printQueueDeadline'
import { createPrintQueueItemSummary } from './printQueueSummary'
import {
  archivePrintQueueItem,
  cancelPrintQueueItem,
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

const statusBadgeClassNames: Record<PrintQueueItem['status'], string> = {
  canceled: 'bg-[#f6e4e1] text-[#9f2a1d]',
  finished: 'bg-[#e5f4e8] text-[#276738]',
  queued: 'bg-[#e8eef0] text-[#52616b]',
  started: 'bg-[#dcebed] text-[#163b45]',
}

const statusRowClassNames: Partial<Record<PrintQueueItem['status'], string>> = {
  canceled: 'bg-[#fffafa]',
  finished: 'bg-[#fbfcfd]',
}

const deadlineStatusClassNames: Record<PrintQueueDeadlineStatus, string> = {
  none: 'bg-[#e8eef0] text-[#52616b]',
  overdue: 'bg-[#f6e4e1] text-[#9f2a1d]',
  today: 'bg-[#fff2cc] text-[#7a5300]',
  tomorrow: 'bg-[#e9f3ff] text-[#1f4f82]',
  upcoming: 'bg-[#e5f4e8] text-[#276738]',
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
  const [queueFilter, setQueueFilter] = useState<PrintQueueFilter>('active')
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
    setQueueItems(sortPrintQueueItems(savedQueueItems))
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
            setQueueItems(sortPrintQueueItems(savedQueueItems))
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

  const nonArchivedQueueItems = useMemo(() => filterPrintQueueItems(queueItems, 'all'), [queueItems])
  const visibleQueueItems = useMemo(
    () => filterPrintQueueItems(queueItems, queueFilter),
    [queueFilter, queueItems],
  )
  const visibleReorderableQueueItems = useMemo(
    () => visibleQueueItems.filter(canReorderPrintQueueItem),
    [visibleQueueItems],
  )
  const queueFilterCounts = useMemo(() => countPrintQueueItemsByFilter(queueItems), [queueItems])

  async function moveQueueItem(item: PrintQueueItem, direction: -1 | 1) {
    const currentIndex = visibleReorderableQueueItems.findIndex(
      (queueItem) => queueItem.id === item.id,
    )
    const targetItem = visibleReorderableQueueItems[currentIndex + direction]

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

  async function cancelItem(item: PrintQueueItem) {
    const result = cancelPrintQueueItem({ item })

    if (!result.success) {
      setQueueMessage(result.message)
      return
    }

    await repositories.printQueue.save(result.item)
    setQueueMessage('Item cancelado.')
    await loadQueueData()
  }

  async function archiveItem(item: PrintQueueItem) {
    await repositories.printQueue.save(archivePrintQueueItem({ item }))
    setQueueMessage('Item removido da fila.')
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
              {visibleQueueItems.length} item(ns) exibido(s)
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
        {nonArchivedQueueItems.length === 0 ? (
          <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
            Nenhuma impressão na fila.
          </section>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {printQueueFilterOptions.map((option) => {
                const isSelected = queueFilter === option.value

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                      isSelected
                        ? 'border-[#1f7a78] bg-[#dcebed] text-[#163b45]'
                        : 'border-[#cfd7dc] bg-white text-[#52616b]'
                    }`}
                    key={option.value}
                    onClick={() => setQueueFilter(option.value)}
                    type="button"
                  >
                    <span>{option.label}</span>
                    <span className="rounded bg-white/70 px-1.5 py-0.5 text-xs">
                      {queueFilterCounts[option.value]}
                    </span>
                  </button>
                )
              })}
            </div>

            {visibleQueueItems.length === 0 ? (
              <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
                Nenhum item neste filtro.
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
                {visibleQueueItems.map((item, index) => {
                  const reorderableIndex = visibleReorderableQueueItems.findIndex(
                    (queueItem) => queueItem.id === item.id,
                  )
                  const summary = createPrintQueueItemSummary({
                    item,
                    materials,
                    printers,
                    printProfiles,
                    products,
                    settings,
                  })
                  const deadlineInfo = createPrintQueueDeadlineInfo(item.deadline)

                  return (
                    <tr className={statusRowClassNames[item.status]} key={item.id}>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#17202a]">{index + 1}</span>
                          <div className="flex gap-1">
                            <button
                              aria-label="Mover para cima"
                              className="rounded-md border border-[#cfd7dc] p-1 text-[#52616b] disabled:opacity-40"
                              disabled={!canReorderPrintQueueItem(item) || reorderableIndex === 0}
                              onClick={() => void moveQueueItem(item, -1)}
                              type="button"
                            >
                              <ArrowUp className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              aria-label="Mover para baixo"
                              className="rounded-md border border-[#cfd7dc] p-1 text-[#52616b] disabled:opacity-40"
                              disabled={
                                !canReorderPrintQueueItem(item) ||
                                reorderableIndex === visibleReorderableQueueItems.length - 1
                              }
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
                          <div className="space-y-1">
                            <div>{deadlineInfo.dateLabel}</div>
                            {deadlineInfo.status !== 'none' && (
                              <span
                                className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                  deadlineStatusClassNames[deadlineInfo.status]
                                }`}
                              >
                                {deadlineInfo.statusLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            statusBadgeClassNames[item.status]
                          }`}
                        >
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
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={item.status === 'finished' || item.status === 'canceled'}
                            onClick={() => void cancelItem(item)}
                            type="button"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Cancelar
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                            onClick={() => void archiveItem(item)}
                            type="button"
                          >
                            <Archive className="h-4 w-4" aria-hidden="true" />
                            Arquivar
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
        )}
      </div>
    </div>
  )
}
