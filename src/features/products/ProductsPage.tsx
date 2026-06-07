import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from '@/app/useRepositories'
import type { Product } from '@/shared/types'
import { createEntityId, createTimestamp } from '@/shared/utils'

import { ProductForm } from './ProductForm'
import { ProductList } from './ProductList'
import type { ProductFormValues } from './productFormSchema'

function sortProductsByName(products: Product[]) {
  return products.toSorted((first, second) => first.name.localeCompare(second.name))
}

function getCategoryOptions(products: Product[]) {
  return Array.from(new Set(products.flatMap((product) => product.categories))).toSorted()
}

export function ProductsPage() {
  const repositories = useRepositories()
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [products, setProducts] = useState<Product[]>([])

  const loadProducts = useCallback(async () => {
    const savedProducts = await repositories.products.list()

    setProducts(sortProductsByName(savedProducts))
  }, [repositories.products])

  useEffect(() => {
    let shouldUpdate = true

    repositories.products
      .list()
      .then((savedProducts) => {
        if (shouldUpdate) {
          setProducts(sortProductsByName(savedProducts))
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          setProducts([])
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [repositories.products])

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive),
    [products],
  )
  const categoryOptions = useMemo(() => getCategoryOptions(products), [products])

  async function saveProduct(values: ProductFormValues) {
    const now = createTimestamp()
    const product: Product = {
      id: editingProduct?.id ?? createEntityId(),
      name: values.name,
      description: values.description,
      categories: values.categories,
      notes: values.notes,
      isActive: editingProduct?.isActive ?? true,
      createdAt: editingProduct?.createdAt ?? now,
      updatedAt: now,
    }

    await repositories.products.save(product)
    setEditingProduct(undefined)
    await loadProducts()
  }

  async function updateProductStatus(product: Product, isActive: boolean) {
    await repositories.products.save({
      ...product,
      isActive,
      updatedAt: createTimestamp(),
    })
    await loadProducts()
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Produtos</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Catálogo de produtos</h1>
          </div>
          <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
            {activeProducts.length} produto(s) ativo(s)
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 pb-6 md:px-8 lg:grid-cols-[minmax(24rem,28rem)_minmax(0,1fr)]">
        <ProductForm
          categoryOptions={categoryOptions}
          onCancelEdit={() => setEditingProduct(undefined)}
          onSubmit={saveProduct}
          product={editingProduct}
        />
        <ProductList
          onArchive={(product) => updateProductStatus(product, false)}
          onEdit={setEditingProduct}
          products={activeProducts}
        />
      </div>
    </div>
  )
}
