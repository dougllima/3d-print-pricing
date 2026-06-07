import { Archive, Pencil } from 'lucide-react'

import type { Printer } from '@/shared/types'
import { formatCurrency } from '@/shared/utils'

type PrinterListProps = {
  onArchive: (printer: Printer) => Promise<void>
  onEdit: (printer: Printer) => void
  printers: Printer[]
}

function formatOptionalCurrency(value?: number) {
  return value === undefined ? '-' : formatCurrency(value)
}

function formatNumber(value?: number, suffix = '') {
  return value === undefined ? '-' : `${value}${suffix}`
}

export function PrinterList({ onArchive, onEdit, printers }: PrinterListProps) {
  if (printers.length === 0) {
    return (
      <section className="rounded-md border border-[#d8dee2] bg-white p-5 text-sm text-[#52616b] shadow-sm">
        Nenhuma impressora ativa cadastrada.
      </section>
    )
  }

  return (
    <section className="rounded-md border border-[#d8dee2] bg-white shadow-sm">
      <div className="border-b border-[#d8dee2] px-5 py-4">
        <h2 className="text-lg font-semibold text-[#17202a]">Impressoras cadastradas</h2>
      </div>
      <div className="divide-y divide-[#edf1f3]">
        {printers.map((printer) => (
          <article
            className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
            key={printer.id}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#17202a]">{printer.name}</h3>
                {printer.model && (
                  <span className="rounded-md bg-[#e8eef0] px-2 py-1 text-xs font-medium text-[#52616b]">
                    {printer.model}
                  </span>
                )}
              </div>

              <dl className="mt-3 grid gap-2 text-sm text-[#52616b] sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Potência</dt>
                  <dd>{formatNumber(printer.powerWatts, ' W')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Valor de compra</dt>
                  <dd>{formatOptionalCurrency(printer.purchasePrice)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Vida útil</dt>
                  <dd>{formatNumber(printer.estimatedLifetimeHours, ' h')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Manutenção por hora</dt>
                  <dd>{formatOptionalCurrency(printer.maintenanceCostPerHour)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[#697782]">Taxa de falha</dt>
                  <dd>{formatNumber(printer.defaultFailureRatePercent, '%')}</dd>
                </div>
              </dl>

              {printer.notes && <p className="mt-3 text-sm text-[#52616b]">{printer.notes}</p>}
            </div>

            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                onClick={() => onEdit(printer)}
                type="button"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm font-medium text-[#34434d]"
                onClick={() => void onArchive(printer)}
                type="button"
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
                Arquivar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
