export const CALCULATION_ERROR_MESSAGES = {
  profitMarginMustBeLowerThan100: 'profitMarginPercent must be lower than 100',
} as const

export const STORAGE_KEYS = {
  materials: '3d-print-pricing:materials',
  printers: '3d-print-pricing:printers',
  products: '3d-print-pricing:products',
  printProfiles: '3d-print-pricing:print-profiles',
  settings: '3d-print-pricing:settings',
  costCalculations: '3d-print-pricing:cost-calculations',
} as const
