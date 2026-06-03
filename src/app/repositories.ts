import { createContext } from 'react'

import { createLocalStorageRepositories, type AppRepositories } from '@/shared/storage'

export const repositories =
  typeof window === 'undefined' ? undefined : createLocalStorageRepositories(window.localStorage)

export const RepositoriesContext = createContext<AppRepositories | undefined>(repositories)
