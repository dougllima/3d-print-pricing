import {
  BarChart3,
  Cuboid,
  Factory,
  History,
  Layers3,
  ListOrdered,
  Package,
  Printer,
  Settings,
} from 'lucide-react'
import { useState } from 'react'

import { DashboardPage } from '@/features/dashboard'
import { HistoryPage } from '@/features/history'
import { MaterialsPage } from '@/features/materials'
import { PrintProfilesPage } from '@/features/print-profiles'
import { PrintQueuePage } from '@/features/print-queue'
import { PrintersPage } from '@/features/printers'
import { ProductsPage } from '@/features/products'
import { SettingsPage } from '@/features/settings'
import { cn } from '@/shared/utils'

type AppSection =
  | 'dashboard'
  | 'history'
  | 'materials'
  | 'printProfiles'
  | 'printQueue'
  | 'printers'
  | 'products'
  | 'settings'

const navigationItems = [
  { label: 'Dashboard', icon: BarChart3, section: 'dashboard' },
  { label: 'Produtos', icon: Package, section: 'products' },
  { label: 'Impressões', icon: Layers3, section: 'printProfiles' },
  { label: 'Fila', icon: ListOrdered, section: 'printQueue' },
  { label: 'Materiais', icon: Cuboid, section: 'materials' },
  { label: 'Impressoras', icon: Printer, section: 'printers' },
  { label: 'Histórico', icon: History, section: 'history' },
  { label: 'Configurações', icon: Settings, section: 'settings' },
]

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard')
  const ActivePage = {
    dashboard: DashboardPage,
    history: HistoryPage,
    materials: MaterialsPage,
    printProfiles: PrintProfilesPage,
    printQueue: PrintQueuePage,
    printers: PrintersPage,
    products: ProductsPage,
    settings: SettingsPage,
  }[activeSection]

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
                <button
                  className={cn(
                    'flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#52616b] transition-colors hover:bg-[#e8eef0] hover:text-[#17202a]',
                    item.section === activeSection && 'bg-[#dcebed] text-[#163b45]',
                  )}
                  key={item.label}
                  onClick={() => {
                    if (item.section !== undefined) {
                      setActiveSection(item.section as AppSection)
                    }
                  }}
                  type="button"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <ActivePage />
        </main>
      </div>
    </div>
  )
}

export default App
