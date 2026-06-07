import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { Printer } from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

import { PrinterForm } from './PrinterForm'
import { PrinterList } from './PrinterList'
import type { PrinterFormValues } from './printerFormSchema'

function sortPrintersByName(printers: Printer[]) {
  return printers.toSorted((first, second) => first.name.localeCompare(second.name))
}

export function PrintersPage() {
  const repositories = useRepositories()
  const [editingPrinter, setEditingPrinter] = useState<Printer | undefined>()
  const [printers, setPrinters] = useState<Printer[]>([])

  const loadPrinters = useCallback(async () => {
    const savedPrinters = await repositories.printers.list()

    setPrinters(sortPrintersByName(savedPrinters))
  }, [repositories.printers])

  useEffect(() => {
    let shouldUpdate = true

    repositories.printers
      .list()
      .then((savedPrinters) => {
        if (shouldUpdate) {
          setPrinters(sortPrintersByName(savedPrinters))
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setPrinters([])
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [repositories.printers])

  const activePrinters = useMemo(
    () => printers.filter((printer) => printer.isActive),
    [printers],
  )

  async function savePrinter(values: PrinterFormValues) {
    const now = createTimestamp()
    const printer: Printer = {
      id: editingPrinter?.id ?? createEntityId(),
      name: values.name,
      model: values.model,
      powerWatts: values.powerWatts,
      purchasePrice: values.purchasePrice,
      estimatedLifetimeHours: values.estimatedLifetimeHours,
      maintenanceCostPerHour: values.maintenanceCostPerHour,
      defaultFailureRatePercent: values.defaultFailureRatePercent,
      notes: values.notes,
      isActive: editingPrinter?.isActive ?? true,
      createdAt: editingPrinter?.createdAt ?? now,
      updatedAt: now,
    }

    await repositories.printers.save(printer)
    setEditingPrinter(undefined)
    await loadPrinters()
  }

  async function archivePrinter(printer: Printer) {
    await repositories.printers.save({
      ...printer,
      isActive: false,
      updatedAt: createTimestamp(),
    })
    await loadPrinters()
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Impressoras</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">
              Cadastro de impressoras FDM
            </h1>
          </div>
          <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
            {activePrinters.length} impressora(s) ativa(s)
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 lg:grid-cols-[minmax(24rem,28rem)_minmax(0,1fr)]">
        <PrinterForm
          onCancelEdit={() => setEditingPrinter(undefined)}
          onSubmit={savePrinter}
          printer={editingPrinter}
        />
        <PrinterList onArchive={archivePrinter} onEdit={setEditingPrinter} printers={activePrinters} />
      </div>
    </div>
  )
}
