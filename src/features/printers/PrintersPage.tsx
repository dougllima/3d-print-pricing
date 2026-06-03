import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { Printer } from '@/shared/types'

import { PrinterForm } from './PrinterForm'
import { PrinterList } from './PrinterList'
import type { PrinterFormValues } from './printerFormSchema'

function createPrinterId() {
  return crypto.randomUUID()
}

function createTimestamp() {
  return new Date().toISOString()
}

export function PrintersPage() {
  const repositories = useRepositories()
  const [editingPrinter, setEditingPrinter] = useState<Printer | undefined>()
  const [printers, setPrinters] = useState<Printer[]>([])

  const loadPrinters = useCallback(async () => {
    const savedPrinters = await repositories.printers.list()

    setPrinters(savedPrinters.toSorted((first, second) => first.name.localeCompare(second.name)))
  }, [repositories.printers])

  useEffect(() => {
    let shouldUpdate = true

    repositories.printers
      .list()
      .then((savedPrinters) => {
        if (shouldUpdate) {
          setPrinters(savedPrinters.toSorted((first, second) => first.name.localeCompare(second.name)))
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

  const activePrintersCount = useMemo(
    () => printers.filter((printer) => printer.isActive).length,
    [printers],
  )

  async function savePrinter(values: PrinterFormValues) {
    const now = createTimestamp()
    const printer: Printer = {
      id: editingPrinter?.id ?? createPrinterId(),
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

  async function updatePrinterStatus(printer: Printer, isActive: boolean) {
    await repositories.printers.save({
      ...printer,
      isActive,
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
            {activePrintersCount} ativas de {printers.length} cadastradas
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 lg:grid-cols-[minmax(24rem,28rem)_minmax(0,1fr)]">
        <PrinterForm
          onCancelEdit={() => setEditingPrinter(undefined)}
          onSubmit={savePrinter}
          printer={editingPrinter}
        />
        <PrinterList
          onArchive={(printer) => updatePrinterStatus(printer, false)}
          onEdit={setEditingPrinter}
          onRestore={(printer) => updatePrinterStatus(printer, true)}
          printers={printers}
        />
      </div>
    </div>
  )
}
