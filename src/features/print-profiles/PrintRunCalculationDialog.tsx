import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { CurrencyInput, UnitInput } from '@/shared/components'
import type { CostCalculation, GlobalSettings, Material, Printer, PrintProfile } from '@/shared/types'
import { createEntityId, formatCurrency, formatMinutes, formatWeightGrams } from '@/shared/utils'

import { createCostCalculationFromPrintRun } from './printProfileCalculation'
import {
  printRunCalculationFormSchema,
  type PrintRunCalculationFormValues,
} from './printRunCalculationFormSchema'
import { createPrintRunSummary } from './printRunSummary'

type PrintRunCalculationDialogProps = {
  materials: Material[]
  onClose: () => void
  onSave: (calculation: CostCalculation) => Promise<void>
  printer: Printer
  printProfile: PrintProfile
  printRun: PrintProfile['printRuns'][number]
  settings: GlobalSettings
}

const fieldClassName =
  'mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]'

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

export function PrintRunCalculationDialog({
  materials,
  onClose,
  onSave,
  printer,
  printProfile,
  printRun,
  settings,
}: PrintRunCalculationDialogProps) {
  const defaultValues: PrintRunCalculationFormValues = {
    failureRatePercent:
      printer.defaultFailureRatePercent ?? settings.defaultFailureRatePercent,
    finishingTasks: [],
    profitMarginPercent: settings.defaultProfitMarginPercent,
  }
  const summary = createPrintRunSummary({ materials, printer, printRun, settings })

  function createCalculation(values: PrintRunCalculationFormValues) {
    return createCostCalculationFromPrintRun({
      failureRatePercent: values.failureRatePercent,
      finishingTasks: values.finishingTasks,
      materials,
      printer,
      printProfile,
      printRun,
      profitMarginPercent: values.profitMarginPercent,
      settings,
    })
  }

  const [preview, setPreview] = useState<CostCalculation | undefined>(() =>
    createCalculation(defaultValues),
  )
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<PrintRunCalculationFormValues>({
    defaultValues,
    resolver: zodResolver(printRunCalculationFormSchema),
  })
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'finishingTasks',
  })

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  async function saveCalculation(values: PrintRunCalculationFormValues) {
    const calculation = createCalculation(values)

    if (calculation !== undefined) {
      await onSave(calculation)
    }
  }

  function updatePreview(values: PrintRunCalculationFormValues) {
    setPreview(createCalculation(values))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="presentation"
    >
      <section
        aria-labelledby="print-run-calculation-title"
        aria-modal="true"
        className="max-h-[calc(100vh-1.5rem)] w-full max-w-6xl overflow-y-auto rounded-md bg-[#f5f7f8] shadow-xl md:max-h-[calc(100vh-3rem)]"
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#d8dee2] bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Cálculo da impressão</p>
            <h2
              className="mt-1 text-xl font-semibold text-[#17202a]"
              id="print-run-calculation-title"
            >
              {printProfile.name} · {printRun.quantity} unidade(s)
            </h2>
          </div>
          <button
            aria-label="Fechar cálculo"
            className="rounded-md border border-[#cfd7dc] p-2 text-[#52616b] hover:bg-[#edf1f3]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <form
          className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]"
          onSubmit={handleSubmit(saveCalculation)}
        >
          <div className="space-y-5">
            <section className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#17202a]">Totais do slicer</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#52616b] sm:grid-cols-4">
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Quantidade</dt>
                  <dd>{printRun.quantity} un.</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Plates</dt>
                  <dd>{printRun.plates.length}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Tempo</dt>
                  <dd>{formatMinutes(summary.totalPrintTimeMinutes)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Peso total</dt>
                  <dd>{formatWeightGrams(summary.totalWeightGrams)}</dd>
                </div>
              </dl>
              <ul className="mt-3 space-y-1 text-xs text-[#697782]">
                {summary.materialUsages.map((usage) => (
                  <li key={usage.id}>
                    {usage.plate.name} · {usage.label ?? 'Material'}: {usage.material?.name} ·{' '}
                    {formatWeightGrams(usage.totalWeightGrams)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#17202a]">Parâmetros comerciais</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#34434d]">
                  Margem de lucro
                  <Controller
                    control={control}
                    name="profitMarginPercent"
                    render={({ field }) => (
                      <UnitInput
                        max={99.99}
                        min={0}
                        onChange={field.onChange}
                        step={0.1}
                        unit="%"
                        value={field.value}
                      />
                    )}
                  />
                  {errors.profitMarginPercent && (
                    <span className="mt-1 block text-xs text-[#b42318]">
                      {errors.profitMarginPercent.message}
                    </span>
                  )}
                </label>
                <label className="text-sm font-medium text-[#34434d]">
                  Reserva de falha
                  <Controller
                    control={control}
                    name="failureRatePercent"
                    render={({ field }) => (
                      <UnitInput
                        max={100}
                        min={0}
                        onChange={field.onChange}
                        step={0.1}
                        unit="%"
                        value={field.value}
                      />
                    )}
                  />
                  {errors.failureRatePercent && (
                    <span className="mt-1 block text-xs text-[#b42318]">
                      {errors.failureRatePercent.message}
                    </span>
                  )}
                </label>
              </div>
            </section>

            <section className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#17202a]">Acabamentos</h3>
                  <p className="mt-1 text-xs text-[#697782]">Opcional para este cálculo.</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() =>
                    append({
                      id: createEntityId(),
                      name: '',
                      hours: 0,
                      hourlyRate: settings.defaultLaborHourlyRate,
                      materialCost: 0,
                    })
                  }
                  type="button"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Adicionar
                </button>
              </div>

              {fields.length === 0 ? (
                <p className="mt-4 text-sm text-[#697782]">Nenhum acabamento adicionado.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {fields.map((field, index) => (
                    <div className="border-t border-[#edf1f3] pt-4 first:border-t-0 first:pt-0" key={field.id}>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="text-sm font-medium text-[#34434d]">
                          Nome
                          <Controller
                            control={control}
                            name={`finishingTasks.${index}.name`}
                            render={({ field: nameField }) => (
                              <input className={fieldClassName} {...nameField} />
                            )}
                          />
                        </label>
                        <label className="text-sm font-medium text-[#34434d]">
                          Tempo
                          <Controller
                            control={control}
                            name={`finishingTasks.${index}.hours`}
                            render={({ field: hoursField }) => (
                              <UnitInput
                                min={0}
                                onChange={hoursField.onChange}
                                step={0.1}
                                unit="h"
                                value={hoursField.value}
                              />
                            )}
                          />
                        </label>
                        <label className="text-sm font-medium text-[#34434d]">
                          Valor por hora
                          <Controller
                            control={control}
                            name={`finishingTasks.${index}.hourlyRate`}
                            render={({ field: rateField }) => (
                              <CurrencyInput
                                className={fieldClassName}
                                onChange={rateField.onChange}
                                value={rateField.value}
                              />
                            )}
                          />
                        </label>
                        <label className="text-sm font-medium text-[#34434d]">
                          Material extra
                          <Controller
                            control={control}
                            name={`finishingTasks.${index}.materialCost`}
                            render={({ field: materialField }) => (
                              <CurrencyInput
                                className={fieldClassName}
                                onChange={materialField.onChange}
                                value={materialField.value}
                              />
                            )}
                          />
                        </label>
                      </div>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <span className="text-xs text-[#b42318]">
                          {errors.finishingTasks?.[index]?.name?.message}
                        </span>
                        <button
                          aria-label="Remover acabamento"
                          className="rounded-md p-2 text-[#b42318] hover:bg-[#f6e4e1]"
                          onClick={() => remove(index)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#1f7a78]" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[#17202a]">Resultado</h3>
            </div>

            {preview === undefined ? (
              <p className="mt-4 text-sm text-[#52616b]">Não foi possível calcular esta variação.</p>
            ) : (
              <>
                <dl className="mt-4 space-y-2 text-sm text-[#52616b]">
                  <div className="flex justify-between gap-3">
                    <dt>Material</dt>
                    <dd>{formatCurrency(preview.result.materialCost)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Energia e máquina</dt>
                    <dd>
                      {formatCurrency(
                        preview.result.energyCost +
                          preview.result.machineCost +
                          preview.result.maintenanceCost,
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Acabamento</dt>
                    <dd>{formatCurrency(preview.result.finishingCost)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Reserva de falha</dt>
                    <dd>{formatCurrency(preview.result.failureReserveCost)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#edf1f3] pt-2 font-medium text-[#17202a]">
                    <dt>Custo total</dt>
                    <dd>{formatCurrency(preview.result.totalCost)}</dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-md bg-[#dcebed] p-4">
                  <p className="text-sm text-[#163b45]">Preço sugerido</p>
                  <p className="mt-1 text-3xl font-semibold text-[#163b45]">
                    {formatCurrency(preview.result.suggestedPrice)}
                  </p>
                  <p className="mt-2 text-sm text-[#52616b]">
                    Lucro: {formatCurrency(preview.result.estimatedProfit)} · Margem:{' '}
                    {formatPercent(preview.result.realMarginPercent)}
                  </p>
                </div>
              </>
            )}

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-4 py-2 text-sm font-medium text-[#34434d]"
                onClick={handleSubmit(updatePreview)}
                type="button"
              >
                <Calculator className="h-4 w-4" aria-hidden="true" />
                Recalcular
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#163b45] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting || preview === undefined}
                type="submit"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Salvar
              </button>
            </div>
          </aside>
        </form>
      </section>
    </div>
  )
}
