import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { Controller, useFieldArray, useForm, type Control, type UseFormRegister } from 'react-hook-form'

import { UnitInput } from '@/shared/components'
import { inputClassName, primaryButtonClassName, secondaryButtonClassName, textareaClassName } from '@/shared/styles'
import type { Material, Printer, PrintProfile, Product } from '@/shared/types'
import { createEntityId } from '@/shared/utils'

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
  slicerProfileOptions: string[]
}

type RunMaterialsFieldsProps = {
  control: Control<PrintProfileFormInputValues>
  materials: Material[]
  register: UseFormRegister<PrintProfileFormInputValues>
  runIndex: number
}

type MaterialWeightFieldName =
  | 'modelWeightGrams'
  | 'supportWeightGrams'
  | 'purgeWeightGrams'
  | 'otherWasteGrams'

const materialWeightFields: Array<{
  fieldName: MaterialWeightFieldName
  label: string
  placeholder: string
}> = [
  { fieldName: 'modelWeightGrams', label: 'Peso do modelo (g)', placeholder: '42 g' },
  { fieldName: 'supportWeightGrams', label: 'Suportes (g)', placeholder: '5 g' },
  { fieldName: 'purgeWeightGrams', label: 'Purga (g)', placeholder: '2 g' },
  { fieldName: 'otherWasteGrams', label: 'Outros desperdícios (g)', placeholder: '1 g' },
]

function createEmptyMaterialUsage() {
  return {
    id: createEntityId(),
    materialId: '',
    modelWeightGrams: 0,
    supportWeightGrams: 0,
    purgeWeightGrams: 0,
    otherWasteGrams: 0,
  }
}

function createEmptyRun() {
  return {
    id: createEntityId(),
    quantity: 1,
    printTimeHours: 0,
    printTimeMinutesPart: 0,
    materials: [createEmptyMaterialUsage()],
  }
}

function toFormValues(printProfile: PrintProfile): PrintProfileFormInputValues {
  return {
    productId: printProfile.productId,
    name: printProfile.name,
    printerId: printProfile.printerId,
    slicerProfileName: printProfile.slicerProfileName,
    printRuns: printProfile.printRuns.map((printRun) => ({
      id: printRun.id,
      quantity: printRun.quantity,
      printTimeHours: Math.floor(printRun.printTimeMinutes / 60),
      printTimeMinutesPart: printRun.printTimeMinutes % 60,
      materials: printRun.materials.map((materialUsage) => ({
        id: materialUsage.id,
        materialId: materialUsage.materialId,
        modelWeightGrams: materialUsage.modelWeightGrams,
        supportWeightGrams: materialUsage.supportWeightGrams,
        purgeWeightGrams: materialUsage.purgeWeightGrams,
        otherWasteGrams: materialUsage.otherWasteGrams,
      })),
    })),
    notes: printProfile.notes,
  }
}

const emptyFormValues: PrintProfileFormInputValues = {
  productId: undefined,
  name: '',
  printerId: '',
  slicerProfileName: undefined,
  printRuns: [createEmptyRun()],
  notes: undefined,
}

function RunMaterialsFields({
  control,
  materials,
  register,
  runIndex,
}: RunMaterialsFieldsProps) {
  const {
    fields: materialFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `printRuns.${runIndex}.materials`,
  })

  return (
    <div className="mt-4 space-y-3">
      {materialFields.map((materialField, materialIndex) => (
        <div className="rounded-md border border-[#edf1f3] bg-white p-3" key={materialField.id}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
              Material
              <select
                className={inputClassName}
                {...register(`printRuns.${runIndex}.materials.${materialIndex}.materialId`)}
              >
                <option value="">Selecione</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            </label>

            {materialWeightFields.map(({ fieldName, label, placeholder }) => (
              <label className="space-y-1 text-sm font-medium text-[#34434d]" key={fieldName}>
                {label}
                <Controller
                  control={control}
                  name={`printRuns.${runIndex}.materials.${materialIndex}.${fieldName}`}
                  render={({ field }) => (
                    <UnitInput
                      max={59}
                      min={0}
                      onChange={field.onChange}
                      placeholder={placeholder.replace(' g', '')}
                      step={0.01}
                      unit="g"
                      value={typeof field.value === 'number' ? field.value : undefined}
                    />
                  )}
                />
              </label>
            ))}
          </div>

          {materialFields.length > 1 && (
            <button
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#f0b4ad] bg-white px-3 py-2 text-sm font-medium text-[#b42318]"
              onClick={() => remove(materialIndex)}
              type="button"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remover material
            </button>
          )}
        </div>
      ))}

      <button
        className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
        onClick={() => append(createEmptyMaterialUsage())}
        type="button"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adicionar material
      </button>
    </div>
  )
}

export function PrintProfileForm({
  materials,
  onCancelEdit,
  onSubmit,
  printers,
  printProfile,
  products,
  slicerProfileOptions,
}: PrintProfileFormProps) {
  const slicerProfileOptionsId = useId()
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<PrintProfileFormInputValues, unknown, PrintProfileFormValues>({
    resolver: zodResolver(printProfileFormSchema),
    defaultValues: emptyFormValues,
  })

  const {
    fields: runFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'printRuns',
  })

  useEffect(() => {
    if (printProfile === undefined) {
      reset(emptyFormValues)
      return
    }

    reset(toFormValues(printProfile))
  }, [printProfile, reset])

  async function submit(values: PrintProfileFormValues) {
    await onSubmit(values)
    reset(emptyFormValues)
  }

  function cancelEdit() {
    reset(emptyFormValues)
    onCancelEdit()
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
            className={inputClassName}
            placeholder="Porta joias - base preta e tampa dourada"
            {...register('name')}
          />
          {errors.name && (
            <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Produto
          <select className={inputClassName} {...register('productId')}>
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
          <select className={inputClassName} {...register('printerId')}>
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
          Perfil do slicer
          <input
            className={inputClassName}
            list={slicerProfileOptionsId}
            placeholder="0.2mm quality"
            {...register('slicerProfileName')}
          />
          <datalist id={slicerProfileOptionsId}>
            {slicerProfileOptions.map((slicerProfileOption) => (
              <option key={slicerProfileOption} value={slicerProfileOption} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase text-[#697782]">Quantidades</h3>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
            onClick={() => append(createEmptyRun())}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adicionar quantidade
          </button>
        </div>

        {runFields.map((runField, runIndex) => (
          <section className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] p-4" key={runField.id}>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Quantidade no plate
                <Controller
                  control={control}
                  name={`printRuns.${runIndex}.quantity`}
                  render={({ field }) => (
                    <UnitInput
                      min={1}
                      onChange={field.onChange}
                      placeholder="10"
                      step={1}
                      unit="un."
                      value={typeof field.value === 'number' ? field.value : undefined}
                    />
                  )}
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Horas
                <Controller
                  control={control}
                  name={`printRuns.${runIndex}.printTimeHours`}
                  render={({ field }) => (
                    <UnitInput
                      min={0}
                      onChange={field.onChange}
                      placeholder="3"
                      step={1}
                      unit="h"
                      value={typeof field.value === 'number' ? field.value : undefined}
                    />
                  )}
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-[#34434d]">
                Minutos
                <Controller
                  control={control}
                  name={`printRuns.${runIndex}.printTimeMinutesPart`}
                  render={({ field }) => (
                    <UnitInput
                      min={0}
                      onChange={field.onChange}
                      placeholder="45"
                      step={1}
                      unit="min"
                      value={typeof field.value === 'number' ? field.value : undefined}
                    />
                  )}
                />
              </label>
            </div>

            <RunMaterialsFields
              control={control}
              materials={materials}
              register={register}
              runIndex={runIndex}
            />

            {runFields.length > 1 && (
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#f0b4ad] bg-white px-3 py-2 text-sm font-medium text-[#b42318]"
                onClick={() => remove(runIndex)}
                type="button"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remover quantidade
              </button>
            )}
          </section>
        ))}

        {errors.printRuns?.message && (
          <span className="block text-xs text-[#b42318]">{errors.printRuns.message}</span>
        )}
      </div>

      <label className="mt-5 block space-y-1 text-sm font-medium text-[#34434d]">
        Observações
        <textarea
          className={textareaClassName}
          placeholder="Configurações do slicer, plates, cores e observações de produção..."
          {...register('notes')}
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className={primaryButtonClassName} disabled={isSubmitting} type="submit">
          <Save className="h-4 w-4" aria-hidden="true" />
          {printProfile === undefined ? 'Salvar impressão' : 'Salvar alterações'}
        </button>
        {printProfile !== undefined && (
          <button className={secondaryButtonClassName} onClick={cancelEdit} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  )
}
