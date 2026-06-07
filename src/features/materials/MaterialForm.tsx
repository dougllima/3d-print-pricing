import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { CurrencyInput } from '@/shared/components'
import { inputClassName } from '@/shared/styles'
import { materialTypes, type Material } from '@/shared/types'

import {
  materialFormSchema,
  type MaterialFormInputValues,
  type MaterialFormValues,
} from './materialFormSchema'

type MaterialFormProps = {
  material?: Material
  onCancelEdit: () => void
  onSubmit: (values: MaterialFormValues) => Promise<void>
}

const emptyFormValues: MaterialFormInputValues = {
  name: '',
  type: 'PLA',
  brand: undefined,
  colorName: undefined,
  colorHex: undefined,
  supplierColorCode: undefined,
  pricePerKg: 0,
  spoolWeightGrams: undefined,
  remainingWeightGrams: undefined,
  lowStockThresholdGrams: undefined,
  notes: undefined,
}

const spoolCountFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function MaterialForm({ material, onCancelEdit, onSubmit }: MaterialFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<MaterialFormInputValues, unknown, MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: emptyFormValues,
  })

  const colorHex = useWatch({ control, name: 'colorHex' })
  const watchedSpoolWeightGrams = useWatch({ control, name: 'spoolWeightGrams' })
  const watchedRemainingWeightGrams = useWatch({ control, name: 'remainingWeightGrams' })
  const spoolWeightGrams =
    typeof watchedSpoolWeightGrams === 'number' ? watchedSpoolWeightGrams : undefined
  const remainingWeightGrams =
    typeof watchedRemainingWeightGrams === 'number' ? watchedRemainingWeightGrams : undefined
  const previewColor = typeof colorHex === 'string' && colorHex !== '' ? colorHex : '#ffffff'
  const spoolEstimate = useMemo(() => {
    if (
      spoolWeightGrams === undefined ||
      remainingWeightGrams === undefined ||
      spoolWeightGrams <= 0
    ) {
      return undefined
    }

    return remainingWeightGrams / spoolWeightGrams
  }, [remainingWeightGrams, spoolWeightGrams])

  useEffect(() => {
    if (material === undefined) {
      reset(emptyFormValues)
      return
    }

    reset({
      name: material.name,
      type: material.type,
      brand: material.brand,
      colorName: material.colorName,
      colorHex: material.colorHex,
      supplierColorCode: material.supplierColorCode,
      pricePerKg: material.pricePerKg,
      spoolWeightGrams: material.spoolWeightGrams,
      remainingWeightGrams: material.remainingWeightGrams,
      lowStockThresholdGrams: material.lowStockThresholdGrams,
      notes: material.notes,
    })
  }, [material, reset])

  async function submit(values: MaterialFormValues) {
    await onSubmit(values)
    reset(emptyFormValues)
  }

  return (
    <form
      className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit(submit)}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#17202a]">
          {material === undefined ? 'Novo material' : 'Editar material'}
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Nome
          <input className={inputClassName} placeholder="PLA Preto Fosco" {...register('name')} />
          {errors.name && (
            <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Tipo
          <select className={inputClassName} {...register('type')}>
            {materialTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Marca
          <input className={inputClassName} placeholder="3D Fila" {...register('brand')} />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Preço por kg
          <Controller
            control={control}
            name="pricePerKg"
            render={({ field }) => (
              <CurrencyInput
                className={inputClassName}
                onChange={field.onChange}
                placeholder="R$ 100,00"
                value={typeof field.value === 'number' ? field.value : undefined}
              />
            )}
          />
          {errors.pricePerKg && (
            <span className="block text-xs text-[#b42318]">{errors.pricePerKg.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Nome da cor
          <input className={inputClassName} placeholder="Preto" {...register('colorName')} />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Cor HEX
          <span className="mt-1 flex gap-2">
            <input
              className="w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
              placeholder="#111827"
              {...register('colorHex')}
            />
            <span
              aria-label="Prévia da cor"
              className="h-10 w-10 shrink-0 rounded-md border border-[#cfd7dc]"
              style={{ backgroundColor: previewColor }}
            />
          </span>
          {errors.colorHex && (
            <span className="block text-xs text-[#b42318]">{errors.colorHex.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Código do fornecedor
          <input className={inputClassName} placeholder="SKU ou código da cor" {...register('supplierColorCode')} />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Peso por rolo
          <input
            className={inputClassName}
            inputMode="decimal"
            min="0"
            placeholder="1000 g"
            step="0.01"
            type="number"
            {...register('spoolWeightGrams', { valueAsNumber: true })}
          />
          {errors.spoolWeightGrams && (
            <span className="block text-xs text-[#b42318]">
              {errors.spoolWeightGrams.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Filamento restante
          <input
            className={inputClassName}
            inputMode="decimal"
            min="0"
            placeholder="1500 g"
            step="0.01"
            type="number"
            {...register('remainingWeightGrams', { valueAsNumber: true })}
          />
          {spoolEstimate !== undefined && (
            <span className="block text-xs text-[#52616b]">
              Equivale a {spoolCountFormatter.format(spoolEstimate)} rolo(s) desse material.
            </span>
          )}
          {errors.remainingWeightGrams && (
            <span className="block text-xs text-[#b42318]">
              {errors.remainingWeightGrams.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Alerta de estoque baixo
          <input
            className={inputClassName}
            inputMode="decimal"
            min="0"
            placeholder="150 g"
            step="0.01"
            type="number"
            {...register('lowStockThresholdGrams', { valueAsNumber: true })}
          />
          {errors.lowStockThresholdGrams && (
            <span className="block text-xs text-[#b42318]">
              {errors.lowStockThresholdGrams.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Observações
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            placeholder="Lote, fornecedor, comportamento de impressão..."
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
          {material === undefined ? 'Salvar material' : 'Salvar alterações'}
        </button>
        {material !== undefined && (
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
