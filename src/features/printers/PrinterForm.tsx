import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { CurrencyInput } from '@/shared/components'
import { inputClassName } from '@/shared/styles'
import type { Printer } from '@/shared/types'

import {
  printerFormSchema,
  type PrinterFormInputValues,
  type PrinterFormValues,
} from './printerFormSchema'

type PrinterFormProps = {
  onCancelEdit: () => void
  onSubmit: (values: PrinterFormValues) => Promise<void>
  printer?: Printer
}

const emptyFormValues: PrinterFormInputValues = {
  name: '',
  model: undefined,
  powerWatts: undefined,
  purchasePrice: undefined,
  estimatedLifetimeHours: undefined,
  maintenanceCostPerHour: undefined,
  defaultFailureRatePercent: undefined,
  notes: undefined,
}

export function PrinterForm({ onCancelEdit, onSubmit, printer }: PrinterFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<PrinterFormInputValues, unknown, PrinterFormValues>({
    resolver: zodResolver(printerFormSchema),
    defaultValues: emptyFormValues,
  })

  useEffect(() => {
    if (printer === undefined) {
      reset(emptyFormValues)
      return
    }

    reset({
      name: printer.name,
      model: printer.model,
      powerWatts: printer.powerWatts,
      purchasePrice: printer.purchasePrice,
      estimatedLifetimeHours: printer.estimatedLifetimeHours,
      maintenanceCostPerHour: printer.maintenanceCostPerHour,
      defaultFailureRatePercent: printer.defaultFailureRatePercent,
      notes: printer.notes,
    })
  }, [printer, reset])

  async function submit(values: PrinterFormValues) {
    await onSubmit(values)
    reset(emptyFormValues)
  }

  return (
    <form
      className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit(submit)}
    >
      <h2 className="text-lg font-semibold text-[#17202a]">
        {printer === undefined ? 'Nova impressora' : 'Editar impressora'}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Nome
          <input className={inputClassName} placeholder="Bambu Lab A1" {...register('name')} />
          {errors.name && (
            <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Modelo
          <input className={inputClassName} placeholder="A1, Ender 3, K1..." {...register('model')} />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Potência
          <input
            className={inputClassName}
            inputMode="numeric"
            min="0"
            placeholder="350 W"
            step="1"
            type="number"
            {...register('powerWatts', { valueAsNumber: true })}
          />
          {errors.powerWatts && (
            <span className="block text-xs text-[#b42318]">{errors.powerWatts.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Valor de compra
          <Controller
            control={control}
            name="purchasePrice"
            render={({ field }) => (
              <CurrencyInput
                className={inputClassName}
                onChange={field.onChange}
                placeholder="R$ 2.000,00"
                value={typeof field.value === 'number' ? field.value : undefined}
              />
            )}
          />
          {errors.purchasePrice && (
            <span className="block text-xs text-[#b42318]">{errors.purchasePrice.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Vida útil estimada
          <input
            className={inputClassName}
            inputMode="numeric"
            min="0"
            placeholder="5000 h"
            step="1"
            type="number"
            {...register('estimatedLifetimeHours', { valueAsNumber: true })}
          />
          {errors.estimatedLifetimeHours && (
            <span className="block text-xs text-[#b42318]">
              {errors.estimatedLifetimeHours.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Manutenção por hora
          <Controller
            control={control}
            name="maintenanceCostPerHour"
            render={({ field }) => (
              <CurrencyInput
                className={inputClassName}
                onChange={field.onChange}
                placeholder="R$ 0,50"
                value={typeof field.value === 'number' ? field.value : undefined}
              />
            )}
          />
          {errors.maintenanceCostPerHour && (
            <span className="block text-xs text-[#b42318]">
              {errors.maintenanceCostPerHour.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Taxa de falha padrão
          <input
            className={inputClassName}
            inputMode="decimal"
            min="0"
            placeholder="5%"
            step="0.1"
            type="number"
            {...register('defaultFailureRatePercent', { valueAsNumber: true })}
          />
          {errors.defaultFailureRatePercent && (
            <span className="block text-xs text-[#b42318]">
              {errors.defaultFailureRatePercent.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Observações
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            placeholder="Manutenções previstas, upgrades, limitações..."
            {...register('notes')}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-md bg-[#163b45] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {printer === undefined ? 'Salvar impressora' : 'Salvar alterações'}
        </button>
        {printer !== undefined && (
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-4 py-2 text-sm font-medium text-[#34434d]"
            onClick={onCancelEdit}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  )
}
