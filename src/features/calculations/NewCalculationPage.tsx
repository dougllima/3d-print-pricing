import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { useRepositories } from '@/app/useRepositories'
import type {
  CostCalculation,
  FinishingTask,
  GlobalSettings,
  Material,
  Printer,
  PrintProfile,
  Product,
} from '@/shared/types'
import { defaultSettings } from '@/shared/types'

import { calculateCost, type CostCalculationResult } from './calculateCost'
import { CalculationBreakdown } from './CalculationBreakdown'
import {
  calculationFormSchema,
  finishingTaskFormSchema,
  type CalculationFormInputValues,
  type CalculationFormValues,
  type FinishingTaskFormValues,
} from './calculationFormSchema'

const emptyCalculationValues: CalculationFormInputValues = {
  name: '',
  productId: undefined,
  printProfileId: undefined,
  printerId: '',
  materialId: '',
  quantity: 1,
  printTimeHours: 0,
  modelWeightGrams: 0,
  supportWeightGrams: 0,
  purgeWeightGrams: 0,
  otherWasteGrams: 0,
  profitMarginPercent: 40,
  failureRatePercent: 5,
}

const emptyFinishingValues = {
  name: '',
  hours: 0,
  hourlyRate: 0,
  materialCost: 0,
}

function createCalculationId() {
  return crypto.randomUUID()
}

function createTimestamp() {
  return new Date().toISOString()
}

function findById<TEntity extends { id: string }>(items: TEntity[], id: string) {
  return items.find((item) => item.id === id)
}

export function NewCalculationPage() {
  const repositories = useRepositories()
  const [finishingTasks, setFinishingTasks] = useState<FinishingTask[]>([])
  const [lastSavedCalculationId, setLastSavedCalculationId] = useState<string | undefined>()
  const [materials, setMaterials] = useState<Material[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [printProfiles, setPrintProfiles] = useState<PrintProfile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [result, setResult] = useState<CostCalculationResult | undefined>()
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    control,
  } = useForm<CalculationFormInputValues, unknown, CalculationFormValues>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: emptyCalculationValues,
  })

  const finishingForm = useForm({
    resolver: zodResolver(finishingTaskFormSchema),
    defaultValues: emptyFinishingValues,
  })

  const selectedPrintProfileValue = useWatch({ control, name: 'printProfileId' })
  const selectedPrintProfileId =
    typeof selectedPrintProfileValue === 'string' ? selectedPrintProfileValue : undefined
  const selectedPrinterValue = useWatch({ control, name: 'printerId' })
  const selectedPrinterId =
    typeof selectedPrinterValue === 'string' ? selectedPrinterValue : undefined

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
          setPrintProfiles(savedPrintProfiles.filter((printProfile) => printProfile.isActive))
          setSettings(savedSettings)
          reset({
            ...emptyCalculationValues,
            profitMarginPercent: savedSettings.defaultProfitMarginPercent,
            failureRatePercent: savedSettings.defaultFailureRatePercent,
          })
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
    reset,
  ])

  useEffect(() => {
    if (selectedPrintProfileId === undefined || selectedPrintProfileId === '') {
      return
    }

    const printProfile = findById(printProfiles, selectedPrintProfileId)

    if (printProfile === undefined) {
      return
    }

    setValue('name', printProfile.name)
    setValue('productId', printProfile.productId)
    setValue('printerId', printProfile.printerId)
    setValue('materialId', printProfile.materialId)
    setValue('printTimeHours', printProfile.printTimeHours)
    setValue('modelWeightGrams', printProfile.modelWeightGrams)
    setValue('supportWeightGrams', printProfile.supportWeightGrams)
    setValue('purgeWeightGrams', printProfile.purgeWeightGrams)
    setValue('otherWasteGrams', printProfile.otherWasteGrams)
  }, [printProfiles, selectedPrintProfileId, setValue])

  useEffect(() => {
    if (selectedPrinterId === undefined || selectedPrinterId === '') {
      return
    }

    const printer = findById(printers, selectedPrinterId)

    setValue(
      'failureRatePercent',
      printer?.defaultFailureRatePercent ?? settings.defaultFailureRatePercent,
    )
  }, [printers, selectedPrinterId, setValue, settings.defaultFailureRatePercent])

  const activePrintProfiles = useMemo(
    () => printProfiles.toSorted((first, second) => first.name.localeCompare(second.name)),
    [printProfiles],
  )

  const calculate = useCallback(
    (values: CalculationFormValues) => {
      const material = findById(materials, values.materialId)
      const printer = findById(printers, values.printerId)

      if (material === undefined || printer === undefined) {
        throw new Error('Material ou impressora não encontrado')
      }

      return calculateCost({
        materialPricePerKg: material.pricePerKg,
        printerPowerWatts: printer.powerWatts,
        electricityCostPerKwh: settings.electricityCostPerKwh,
        printerPurchasePrice: printer.purchasePrice,
        printerEstimatedLifetimeHours: printer.estimatedLifetimeHours,
        printerMaintenanceCostPerHour: printer.maintenanceCostPerHour,
        printTimeHours: values.printTimeHours,
        modelWeightGrams: values.modelWeightGrams,
        supportWeightGrams: values.supportWeightGrams,
        purgeWeightGrams: values.purgeWeightGrams,
        otherWasteGrams: values.otherWasteGrams,
        quantity: values.quantity,
        finishingTasks,
        failureRatePercent: values.failureRatePercent,
        profitMarginPercent: values.profitMarginPercent,
      })
    },
    [finishingTasks, materials, printers, settings.electricityCostPerKwh],
  )

  async function submit(values: CalculationFormValues) {
    const material = findById(materials, values.materialId)
    const printer = findById(printers, values.printerId)

    if (material === undefined || printer === undefined) {
      return
    }

    const calculationResult = calculate(values)
    const costCalculation: CostCalculation = {
      id: createCalculationId(),
      productId: values.productId,
      printProfileId: values.printProfileId,
      name: values.name,
      snapshot: {
        materialName: material.name,
        materialPricePerKg: material.pricePerKg,
        printerName: printer.name,
        printerPowerWatts: printer.powerWatts,
        printerPurchasePrice: printer.purchasePrice,
        printerEstimatedLifetimeHours: printer.estimatedLifetimeHours,
        printerMaintenanceCostPerHour: printer.maintenanceCostPerHour,
        electricityCostPerKwh: settings.electricityCostPerKwh,
        profitMarginPercent: values.profitMarginPercent,
        failureRatePercent: values.failureRatePercent,
      },
      input: {
        quantity: values.quantity,
        printTimeHours: values.printTimeHours,
        modelWeightGrams: values.modelWeightGrams,
        supportWeightGrams: values.supportWeightGrams,
        purgeWeightGrams: values.purgeWeightGrams,
        otherWasteGrams: values.otherWasteGrams,
      },
      finishingTasks,
      result: calculationResult,
      createdAt: createTimestamp(),
    }

    await repositories.costCalculations.save(costCalculation)
    setResult(calculationResult)
    setLastSavedCalculationId(costCalculation.id)
  }

  async function preview(values: CalculationFormValues) {
    setResult(calculate(values))
    setLastSavedCalculationId(undefined)
  }

  function addFinishingTask(values: FinishingTaskFormValues) {
    setFinishingTasks((currentTasks) => [
      ...currentTasks,
      {
        id: crypto.randomUUID(),
        name: values.name,
        hours: values.hours,
        hourlyRate: values.hourlyRate,
        materialCost: values.materialCost,
      },
    ])
    finishingForm.reset(emptyFinishingValues)
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Novo cálculo</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">
              Calcular custo e preço
            </h1>
          </div>
          {lastSavedCalculationId && (
            <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
              Cálculo salvo no histórico.
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 xl:grid-cols-[minmax(32rem,40rem)_minmax(0,1fr)]">
        <div className="space-y-5">
          <form
            className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
            onSubmit={handleSubmit(submit)}
          >
            <h2 className="text-lg font-semibold text-[#17202a]">Dados do cálculo</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
                Impressão salva
                <select
                  className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                  {...register('printProfileId')}
                >
                  <option value="">Cálculo avulso</option>
                  {activePrintProfiles.map((printProfile) => (
                    <option key={printProfile.id} value={printProfile.id}>
                      {printProfile.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Nome
                <input
                  className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Produto
                <select
                  className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                  {...register('productId')}
                >
                  <option value="">Avulso</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Impressora
                <select
                  className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                  {...register('printerId')}
                >
                  <option value="">Selecione</option>
                  {printers.map((printer) => (
                    <option key={printer.id} value={printer.id}>
                      {printer.name}
                    </option>
                  ))}
                </select>
                {errors.printerId && (
                  <span className="block text-xs text-[#b42318]">{errors.printerId.message}</span>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Material
                <select
                  className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                  {...register('materialId')}
                >
                  <option value="">Selecione</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
                {errors.materialId && (
                  <span className="block text-xs text-[#b42318]">{errors.materialId.message}</span>
                )}
              </label>

              {[
                ['quantity', 'Quantidade', 1],
                ['printTimeHours', 'Tempo de impressão', 0.01],
                ['modelWeightGrams', 'Peso do modelo', 0.01],
                ['supportWeightGrams', 'Suportes', 0.01],
                ['purgeWeightGrams', 'Purga', 0.01],
                ['otherWasteGrams', 'Outros desperdícios', 0.01],
                ['profitMarginPercent', 'Margem de lucro', 0.1],
                ['failureRatePercent', 'Taxa de falha', 0.1],
              ].map(([fieldName, label, step]) => (
                <label className="space-y-1 text-sm font-medium text-[#34434d]" key={fieldName}>
                  {label}
                  <input
                    className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                    min="0"
                    step={step}
                    type="number"
                    {...register(fieldName as keyof CalculationFormInputValues, {
                      valueAsNumber: true,
                    })}
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-4 py-2 text-sm font-medium text-[#34434d]"
                onClick={handleSubmit(preview)}
                type="button"
              >
                Calcular
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-[#163b45] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Salvar no histórico
              </button>
            </div>
          </form>

          <form
            className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
            onSubmit={finishingForm.handleSubmit(addFinishingTask)}
          >
            <h2 className="text-lg font-semibold text-[#17202a]">Acabamento opcional</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <input
                className="rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                placeholder="Nome"
                {...finishingForm.register('name')}
              />
              <input
                className="rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                min="0"
                step="0.01"
                type="number"
                {...finishingForm.register('hours', { valueAsNumber: true })}
              />
              <input
                className="rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                min="0"
                step="0.01"
                type="number"
                {...finishingForm.register('hourlyRate', { valueAsNumber: true })}
              />
              <input
                className="rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                min="0"
                step="0.01"
                type="number"
                {...finishingForm.register('materialCost', { valueAsNumber: true })}
              />
            </div>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-4 py-2 text-sm font-medium text-[#34434d]"
              type="submit"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar acabamento
            </button>

            {finishingTasks.length > 0 && (
              <ul className="mt-4 space-y-2">
                {finishingTasks.map((task) => (
                  <li
                    className="flex items-center justify-between rounded-md bg-[#f5f7f8] px-3 py-2 text-sm text-[#52616b]"
                    key={task.id}
                  >
                    {task.name} | {task.hours} h
                    <button
                      aria-label="Remover acabamento"
                      className="text-[#b42318]"
                      onClick={() =>
                        setFinishingTasks((currentTasks) =>
                          currentTasks.filter((currentTask) => currentTask.id !== task.id),
                        )
                      }
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>

        <CalculationBreakdown result={result} settings={settings} />
      </div>
    </div>
  )
}
