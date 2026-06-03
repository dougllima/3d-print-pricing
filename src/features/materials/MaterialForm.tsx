import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

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

export function MaterialForm({ material, onCancelEdit, onSubmit }: MaterialFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    control,
  } = useForm<MaterialFormInputValues, unknown, MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: emptyFormValues,
  })

  const colorHex = useWatch({ control, name: 'colorHex' })
  const previewColor = typeof colorHex === 'string' && colorHex !== '' ? colorHex : '#ffffff'

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
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('name')}
          />
          {errors.name && (
            <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Tipo
          <select
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('type')}
          >
            {materialTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Marca
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('brand')}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Preço por kg
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('pricePerKg', { valueAsNumber: true })}
          />
          {errors.pricePerKg && (
            <span className="block text-xs text-[#b42318]">{errors.pricePerKg.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Nome da cor
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('colorName')}
          />
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
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('supplierColorCode')}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Peso do rolo (g)
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
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
          Peso restante (g)
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('remainingWeightGrams', { valueAsNumber: true })}
          />
          {errors.remainingWeightGrams && (
            <span className="block text-xs text-[#b42318]">
              {errors.remainingWeightGrams.message}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Alerta de estoque baixo (g)
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
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
