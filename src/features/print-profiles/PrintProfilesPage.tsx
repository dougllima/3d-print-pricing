import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import {
  defaultSettings,
  type GlobalSettings,
  type Material,
  type Printer,
  type PrintProfile,
  type Product,
} from '@/shared/types'

import { createPrintQueueItem } from '../print-queue/printQueueService'
import { PrintProfileForm } from './PrintProfileForm'
import { PrintProfileList } from './PrintProfileList'
import {
  applyPrintProfileChanges,
  createDuplicatedPrintProfile,
  createPrintProfileFromFormValues,
} from './printProfileService'
import { createCostCalculationFromPrintRun } from './printProfileCalculation'
import type { PrintProfileFormValues } from './printProfileFormSchema'

function sortPrintProfilesByName(printProfiles: PrintProfile[]) {
  return printProfiles.toSorted((first, second) => first.name.localeCompare(second.name))
}

function getSlicerProfileOptions(printProfiles: PrintProfile[]) {
  return Array.from(
    new Set(
      printProfiles.flatMap((printProfile) =>
        printProfile.slicerProfileName === undefined ? [] : [printProfile.slicerProfileName],
      ),
    ),
  ).toSorted()
}

export function PrintProfilesPage() {
  const repositories = useRepositories()
  const [editingPrintProfile, setEditingPrintProfile] = useState<PrintProfile | undefined>()
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [printProfiles, setPrintProfiles] = useState<PrintProfile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>()
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings)

  const loadPrintProfiles = useCallback(async () => {
    const savedPrintProfiles = await repositories.printProfiles.list()

    setPrintProfiles(sortPrintProfilesByName(savedPrintProfiles))
  }, [repositories.printProfiles])

  useEffect(() => {
    let shouldUpdate = true

    Promise.all([
      repositories.materials.list(),
      repositories.printers.list(),
      repositories.products.list(),
      repositories.printProfiles.list(),
      repositories.settings.get(),
    ])
      .then(([savedMaterials, savedPrinters, savedProducts, savedPrintProfiles, savedSettings]) => {
        if (shouldUpdate) {
          setMaterials(savedMaterials.filter((material) => material.isActive))
          setPrinters(savedPrinters.filter((printer) => printer.isActive))
          setProducts(savedProducts.filter((product) => product.isActive))
          setSettings(savedSettings)
          setPrintProfiles(sortPrintProfilesByName(savedPrintProfiles))
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setMaterials([])
          setPrinters([])
          setProducts([])
          setPrintProfiles([])
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [
    repositories.materials,
    repositories.printers,
    repositories.printProfiles,
    repositories.products,
    repositories.settings,
  ])

  const activePrintProfiles = useMemo(
    () => printProfiles.filter((printProfile) => printProfile.isActive),
    [printProfiles],
  )
  const slicerProfileOptions = useMemo(
    () => getSlicerProfileOptions(printProfiles),
    [printProfiles],
  )

  async function savePrintProfile(values: PrintProfileFormValues) {
    await repositories.printProfiles.save(
      createPrintProfileFromFormValues({
        editingPrintProfile,
        values,
      }),
    )
    setEditingPrintProfile(undefined)
    await loadPrintProfiles()
  }

  async function updatePrintProfile(printProfile: PrintProfile, changes: Partial<PrintProfile>) {
    await repositories.printProfiles.save(applyPrintProfileChanges(printProfile, changes))
    await loadPrintProfiles()
  }

  async function duplicatePrintProfile(printProfile: PrintProfile) {
    await repositories.printProfiles.save(createDuplicatedPrintProfile(printProfile))
    await loadPrintProfiles()
  }

  async function addPrintRunToQueue(
    printProfile: PrintProfile,
    printRun: PrintProfile['printRuns'][number],
  ) {
    const existingItems = await repositories.printQueue.list()

    await repositories.printQueue.save(
      createPrintQueueItem({
        existingItems,
        printProfileId: printProfile.id,
        printRunId: printRun.id,
      }),
    )
    setFeedbackMessage('Impressão adicionada à fila.')
  }

  async function savePrintRunCalculation(
    printProfile: PrintProfile,
    printRun: PrintProfile['printRuns'][number],
  ) {
    const printer = printers.find((savedPrinter) => savedPrinter.id === printProfile.printerId)
    const costCalculation = createCostCalculationFromPrintRun({
      materials,
      printer,
      printProfile,
      printRun,
      settings,
    })

    if (costCalculation === undefined) {
      setFeedbackMessage('Defina impressora e filamentos antes de salvar o cálculo.')
      return
    }

    await repositories.costCalculations.save(costCalculation)
    setFeedbackMessage('Cálculo salvo no histórico.')
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Impressões</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">
              Perfis de fabricação
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
              {activePrintProfiles.length} impressão(ões) ativa(s)
            </div>
            {feedbackMessage && (
              <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
                {feedbackMessage}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 xl:grid-cols-[minmax(28rem,32rem)_minmax(0,1fr)]">
        <PrintProfileForm
          materials={materials}
          onCancelEdit={() => setEditingPrintProfile(undefined)}
          onSubmit={savePrintProfile}
          printers={printers}
          printProfile={editingPrintProfile}
          products={products}
          slicerProfileOptions={slicerProfileOptions}
        />
        <PrintProfileList
          materials={materials}
          onAddToQueue={addPrintRunToQueue}
          onArchive={(printProfile) => updatePrintProfile(printProfile, { isActive: false })}
          onDuplicate={duplicatePrintProfile}
          onEdit={setEditingPrintProfile}
          onSaveCalculation={savePrintRunCalculation}
          onToggleFavorite={(printProfile) =>
            updatePrintProfile(printProfile, { isFavorite: !printProfile.isFavorite })
          }
          printers={printers}
          printProfiles={activePrintProfiles}
          products={products}
          settings={settings}
        />
      </div>
    </div>
  )
}
