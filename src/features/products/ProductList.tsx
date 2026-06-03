import { Archive, Pencil, RotateCcw } from 'lucide-react'

import type { Product } from '@/shared/types'

type ProductListProps = {
  onArchive: (product: Product) => Promise<void>
  onEdit: (product: Product) => void
  onRestore: (product: Product) => Promise<void>
  products: Product[]
}

export function ProductList({ onArchive, onEdit, onRestore, products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
        Nenhum produto cadastrado.
      </section>
    )
  }

  return (
    <section className="rounded-md border border-[#d8dee2] bg-white shadow-sm">
      <div className="border-b border-[#d8dee2] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#17202a]">Produtos cadastrados</h2>
      </div>
      <div className="divide-y divide-[#edf1f3]">
        {products.map((product) => (
          <article
            className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
            key={product.id}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#17202a]">{product.name}</h3>
                {product.category && (
                  <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                    {product.category}
                  </span>
                )}
                <span className="rounded-md bg-[#f3e7d7] px-2 py-1 text-xs font-medium text-[#9a5b25]">
                  {product.isActive ? 'Ativo' : 'Arquivado'}
                </span>
              </div>
              {product.description && (
                <p className="mt-3 text-sm text-[#52616b]">{product.description}</p>
              )}
              {product.notes && <p className="mt-3 text-sm text-[#52616b]">{product.notes}</p>}
            </div>

            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                onClick={() => onEdit(product)}
                type="button"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </button>
              {product.isActive ? (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() => void onArchive(product)}
                  type="button"
                >
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  Arquivar
                </button>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                  onClick={() => void onRestore(product)}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reativar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
