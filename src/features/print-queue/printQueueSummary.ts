import type {
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  PrintQueueItem,
  Product,
} from '@/shared/types'

import { createPrintRunSummary, findEntityName } from '../print-profiles/printRunSummary'

export type PrintQueueItemSummary = {
  filamentNames: string[]
  plateCount: number
  printProfile?: PrintProfile
  productName: string
  run?: PrintProfile['printRuns'][number]
  totalPrintTimeMinutes: number
}

function findById<TEntity extends { id: string }>(items: TEntity[], id?: string) {
  if (id === undefined) {
    return undefined
  }

  return items.find((item) => item.id === id)
}

export function createPrintQueueItemSummary(input: {
  item: PrintQueueItem
  materials: Material[]
  printers: Printer[]
  printProfiles: PrintProfile[]
  products: Product[]
  settings: GlobalSettings
}): PrintQueueItemSummary {
  const printProfile = findById(input.printProfiles, input.item.printProfileId)
  const run = printProfile?.printRuns.find((printRun) => printRun.id === input.item.printRunId)
  const printer = findById(input.printers, printProfile?.printerId)
  const productName = findEntityName(input.products, printProfile?.productId)

  if (run === undefined) {
    return {
      filamentNames: [],
      plateCount: 0,
      printProfile,
      productName,
      run,
      totalPrintTimeMinutes: 0,
    }
  }

  const runSummary = createPrintRunSummary({
    materials: input.materials,
    printRun: run,
    printer,
    settings: input.settings,
  })
  const filamentNames = [
    ...new Set(
      runSummary.materialUsages.map((materialUsage) => materialUsage.material?.name ?? 'Pendente'),
    ),
  ]

  return {
    filamentNames,
    plateCount: run.plates.length,
    printProfile,
    productName,
    run,
    totalPrintTimeMinutes: runSummary.totalPrintTimeMinutes,
  }
}
