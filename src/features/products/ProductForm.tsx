import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import type { Product } from '@/shared/types'

import {
  productFormSchema,
  type ProductFormInputValues,
  type ProductFormValues,
} from './productFormSchema'

type ProductFormProps = {
  onCancelEdit: () => void
  onSubmit: (values: ProductFormValues) => Promise<void>
  product?: Product
}

const inputClassName =
  'mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]'

const emptyFormValues: ProductFormInputValues = {
  name: '',
  description: undefined,
  category: undefined,
  notes: undefined,
}

export function ProductForm({ onCancelEdit, onSubmit, product }: ProductFormProps) {
  const {
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
      category: product.category,
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
          Categoria
          <input className={inputClassName} placeholder="Organização" {...register('category')} />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Descrição
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            placeholder="Produto de catálogo, sem dados de impressão."
            {...register('description')}
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-[#34434d] md:col-span-2">
          Observações
          <textarea
            className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
            placeholder="Variações, acabamento esperado, detalhes comerciais..."
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
          {product === undefined ? 'Salvar produto' : 'Salvar alterações'}
        </button>
        {product !== undefined && (
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
