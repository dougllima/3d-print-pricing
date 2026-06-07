import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { TagInput } from '@/shared/components'
import {
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from '@/shared/styles'
import type { Product } from '@/shared/types'

import {
  productFormSchema,
  type ProductFormInputValues,
  type ProductFormValues,
} from './productFormSchema'

type ProductFormProps = {
  categoryOptions: string[]
  onCancelEdit: () => void
  onSubmit: (values: ProductFormValues) => Promise<void>
  product?: Product
}

const emptyFormValues: ProductFormInputValues = {
  name: '',
  description: undefined,
  categories: [],
  notes: undefined,
}

export function ProductForm({ categoryOptions, onCancelEdit, onSubmit, product }: ProductFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProductFormInputValues, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyFormValues,
  })

  useEffect(() => {
    if (product === undefined) {
      reset(emptyFormValues)
      return
    }

    reset({
      name: product.name,
      description: product.description,
      categories: product.categories,
      notes: product.notes,
    })
  }, [product, reset])

  async function submit(values: ProductFormValues) {
    await onSubmit(values)
    reset(emptyFormValues)
  }

  return (
    <form
      className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm"
      onSubmit={handleSubmit(submit)}
    >
      <h2 className="text-lg font-semibold text-[#17202a]">
        {product === undefined ? 'Novo produto' : 'Editar produto'}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Nome
          <input className={inputClassName} placeholder="Porta joias" {...register('name')} />
          {errors.name && (
            <span className="block text-xs text-[#b42318]">{errors.name.message}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d]">
          Categorias
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <TagInput
                addLabel="Adicionar"
                onChange={field.onChange}
                placeholder="Organização"
                suggestions={categoryOptions}
                value={field.value}
              />
            )}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Descrição
          <textarea
            className={textareaClassName}
            placeholder="Produto de catálogo, sem dados de impressão."
            {...register('description')}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Observações
          <textarea
            className={textareaClassName}
            placeholder="Variações, acabamento esperado, detalhes comerciais..."
            {...register('notes')}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className={primaryButtonClassName} disabled={isSubmitting} type="submit">
          <Save className="h-4 w-4" aria-hidden="true" />
          {product === undefined ? 'Salvar produto' : 'Salvar alterações'}
        </button>
        {product !== undefined && (
          <button className={secondaryButtonClassName} onClick={onCancelEdit} type="button">
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  )
}
