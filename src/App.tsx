import {
  BarChart3,
  Calculator,
  Clock,
  Cog,
  Cuboid,
  Factory,
  History,
  Layers3,
  Package,
  Printer,
  Settings,
} from 'lucide-react'

import { cn } from '@/shared/utils'

const navigationItems = [
  { label: 'Dashboard', icon: BarChart3, isActive: true },
  { label: 'Novo cálculo', icon: Calculator },
  { label: 'Produtos', icon: Package },
  { label: 'Impressões', icon: Layers3 },
  { label: 'Materiais', icon: Cuboid },
  { label: 'Impressoras', icon: Printer },
  { label: 'Histórico', icon: History },
  { label: 'Configurações', icon: Settings },
]

const metrics = [
  { label: 'Materiais cadastrados', value: '0', detail: 'Pronto para iniciar o catálogo' },
  { label: 'Impressoras ativas', value: '0', detail: 'Depreciação e energia virão depois' },
  { label: 'Cálculos salvos', value: '0', detail: 'Histórico local será criado na Fase 3' },
]

const nextSteps = [
  'Modelar tipos de domínio',
  'Criar schemas Zod',
  'Implementar motor de cálculo',
  'Cobrir fórmulas com Vitest',
]

function App() {
  return (
    <div className="min-h-screen bg-[#f5f7f8] text-[#17202a]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-[#d8dee2] bg-[#fbfcfd] px-4 py-4 lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center gap-3 lg:mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#163b45] text-white">
              <Factory className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17202a]">3D Print Pricing</p>
              <p className="text-xs text-[#697782]">MVP de precificação FDM</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <a
                  className={cn(
                    'flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#52616b] transition-colors hover:bg-[#e8eef0] hover:text-[#17202a]',
                    item.isActive && 'bg-[#dcebed] text-[#163b45]',
                  )}
                  href="#"
                  key={item.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </a>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-[#1f7a78]">Fase 1</p>
                <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">
                  Fundação do aplicativo
                </h1>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
                <Clock className="h-4 w-4 text-[#b46a2a]" aria-hidden="true" />
                Pronto para evoluir por features
              </div>
            </div>
          </header>

          <section className="px-5 py-6 md:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <article
                  className="rounded-md border border-[#d8dee2] bg-white p-4 shadow-sm"
                  key={metric.label}
                >
                  <p className="text-sm text-[#697782]">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#17202a]">{metric.value}</p>
                  <p className="mt-2 text-sm text-[#52616b]">{metric.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <section className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f3e7d7] text-[#9a5b25]">
                    <Cog className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#17202a]">
                      Estrutura inicial configurada
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52616b]">
                      Esta tela substitui o scaffold padrão do Vite e prepara a base visual para
                      Dashboard, Novo cálculo, Produtos, Impressões, Materiais, Impressoras,
                      Histórico e Configurações.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#17202a]">Próxima fase</h2>
                <ul className="mt-4 space-y-3">
                  {nextSteps.map((step) => (
                    <li className="flex items-center gap-3 text-sm text-[#52616b]" key={step}>
                      <span className="h-2 w-2 rounded-full bg-[#1f7a78]" aria-hidden="true" />
                      {step}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
