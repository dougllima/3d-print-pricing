import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { Material, Printer, PrintProfile, Product } from '@/shared/types'

import {
  printProfileFormSchema,
  type PrintProfileFormInputValues,
  type PrintProfileFormValues,
} from './printProfileFormSchema'

type PrintProfileFormProps = {
  materials: Material[]
  onCancelEdit: () => void
  onSubmit: (values: PrintProfileFormValues) => Promise<void>
  printers: Printer[]
  printProfile?: PrintProfile
  products: Product[]
}

const emptyFormValues: PrintProfileFormInputValues = {
  productId: undefined,
  name: '',
  printerId: '',
  materialId: '',
  slicerProfileName: undefined,
  layerHeightMm: undefined,
  nozzleDiameterMm: undefined,
  infillPercent: undefined,
  wallLoops: undefined,
  printTimeHours: 0,
  modelWeightGrams: 0,
  supportWeightGrams: 0,
  purgeWeightGrams: 0,
  otherWasteGrams: 0,
  notes: undefined,
}

export function PrintProfileForm({
  materials,
  onCancelEdit,
  onSubmit,
  printers,
  printProfile,
  products,
}: PrintProfileFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<PrintProfileFormInputValues, unknown, PrintProfileFormValues>({
    resolver: zodResolver(printProfileFormSchema),
    defaultValues: emptyFormValues,
  })

  useEffect(() => {
    if (printProfile === undefined) {
      reset(emptyFormValues)
      return
    }

    reset({
      productId: printProfile.productId,
      name: printProfile.name,
      printerId: printProfile.printerId,
      materialId: printProfile.materialId,
      slicerProfileName: printProfile.slicerProfileName,
      layerHeightMm: printProfile.layerHeightMm,
      nozzleDiameterMm: printProfile.nozzleDiameterMm,
      infillPercent: printProfile.infillPercent,
      wallLoops: printProfile.wallLoops,
      printTimeHours: printProfile.printTimeHours,
      modelWeightGrams: printProfile.modelWeightGrams,
      supportWeightGrams: printProfile.supportWeightGrams,
      purgeWeightGrams: printProfile.purgeWeightGrams,
      otherWasteGrams: printProfile.otherWasteGrams,
      notes: printProfile.notes,
    })
  }, [printProfile, reset])

  async function submit(values: PrintProfileFormValues) {
    await onSubmit(values)
    reset(emptyFormValues)
  }

  return (
    <form
      className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit(submit)}
    >
      <h2 className="text-lg font-semibold text-[#17202a]">
        {printProfile === undefined ? 'Nova impressão' : 'Editar impressão'}
      </h2>

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
          Produto
          <select
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('productId')}
          >
            <option value="">Avulsa</option>
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

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Perfil do slicer
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            {...register('slicerProfileName')}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Tempo de impressão
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('printTimeHours', { valueAsNumber: true })}
          />
          {errors.printTimeHours && (
            <span className="block text-xs text-[#b42318]">{errors.printTimeHours.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Altura de camada
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('layerHeightMm', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Bico
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('nozzleDiameterMm', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Infill
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.1"
            type="number"
            {...register('infillPercent', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Paredes
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="1"
            type="number"
            {...register('wallLoops', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Peso do modelo
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('modelWeightGrams', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Suportes
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('supportWeightGrams', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Purga
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('purgeWeightGrams', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Outros desperdícios
          <input
            className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            min="0"
            step="0.01"
            type="number"
            {...register('otherWasteGrams', { valueAsNumber: true })}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Observações
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
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
          {printProfile === undefined ? 'Salvar impressão' : 'Salvar alterações'}
        </button>
        {printProfile !== undefined && (
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
