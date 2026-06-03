import { useContext } from 'react'

import { RepositoriesContext } from './repositories'

export function useRepositories() {
  const repositories = useContext(RepositoriesContext)

  if (repositories === undefined) {
    throw new Error('Repositories are not available')
  }

  return repositories
}
