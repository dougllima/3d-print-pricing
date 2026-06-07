# Domain Model

## Material

Represents a filament material.

```ts
export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'OTHER'

export type Material = {
  id: string
  name: string
  type: MaterialType
  brand?: string
  colorName?: string
  colorHex?: string
  supplierColorCode?: string
  pricePerKg: number
  spoolWeightGrams?: number
  remainingWeightGrams?: number
  lowStockThresholdGrams?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

Rules:

- `pricePerKg` is required.
- `colorHex` is optional.
- If `colorHex` is provided, validate it as a valid HEX color.
- The UI may use a native color picker, but values are stored as HEX.
- `spoolWeightGrams` is optional and represents the nominal filament amount in one spool.
- `remainingWeightGrams` is optional and represents the currently available filament amount.
- `lowStockThresholdGrams` is optional and controls low-stock alerts.
- `remainingWeightGrams` may be greater than `spoolWeightGrams`; in that case it represents more than one spool of the same material.
- Stock fields are measured in grams.
- Material stock tracking is lightweight in v1.1 and does not include stock movement history.
- Materials should be archived/deactivated instead of permanently deleted when possible.
- Archived materials should not appear in the main list or selection fields by default.

---

## Printer

Represents an FDM printer.

```ts
export type Printer = {
  id: string
  name: string
  model?: string
  powerWatts?: number
  purchasePrice?: number
  estimatedLifetimeHours?: number
  maintenanceCostPerHour?: number
  defaultFailureRatePercent?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

Rules:

- `powerWatts` is optional.
- If printer depreciation data is missing, machine depreciation cost should be zero.
- If maintenance cost is missing, maintenance cost should be zero.
- `defaultFailureRatePercent` can override global failure rate when present.
- Archived printers should not appear in the main list or selection fields by default.

---

## Product

Represents a catalog item.

```ts
export type Product = {
  id: string
  name: string
  description?: string
  categories: string[]
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

Rules:

- Product does not store print time, material, weight, slicer profile, slicer settings or finishing.
- Those belong to PrintProfile or CostCalculation.
- A product may have multiple categories.
- Category suggestions are derived from categories already used by products.
- Users may type a new category when creating or editing a product.
- Archived products should not appear in the main list or selection fields by default.

---

## PrintProfile

Represents a specific way to manufacture a product.

UI name: Impressao / Impressoes.

```ts
export type PrintProfileMaterialUsage = {
  id: string
  materialId: string
  modelWeightGrams: number
  supportWeightGrams: number
  purgeWeightGrams: number
  otherWasteGrams: number
}

export type PrintProfileRun = {
  id: string
  quantity: number
  printTimeMinutes: number
  materials: PrintProfileMaterialUsage[]
}

export type PrintProfile = {
  id: string
  productId?: string
  name: string
  printerId: string
  printRuns: PrintProfileRun[]
  slicerProfileName?: string
  notes?: string
  isFavorite?: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

Rules:

- Product remains independent from materials, printer, weights and slicer settings.
- PrintProfile belongs to one printer and may optionally belong to one product.
- PrintProfile may use one or more materials.
- PrintProfile may have one or more quantity-specific print runs.
- Each print run stores total slicer output for that quantity.
- Saved print run weights and time must not be multiplied by quantity again.
- Time is stored as `printTimeMinutes`; UI should collect hours and minutes.
- `slicerProfileName` is optional and may suggest values from existing print profiles.
- Detailed slicer configuration fields such as layer height, nozzle, infill and walls are not stored in v1.1.
- Cost can be shown as generated output inside the Impressoes UI.
- Archived print profiles should not appear in the main list by default.

Legacy migration notes:

- Older saved print profiles may contain a single `materialId`, `printTimeHours` and flat weight fields.
- The schema may normalize those records into one `PrintProfileRun` for compatibility.
- Removed slicer configuration fields should be accepted only for migration and omitted from normalized domain output.

---

## FinishingTask

Represents an optional finishing step used inside a cost calculation.

```ts
export type FinishingTask = {
  id: string
  name: string
  hours: number
  hourlyRate: number
  materialCost: number
}
```

Examples:

- Support removal.
- Sanding.
- Painting.
- Varnish.
- Assembly.

Rules:

- Finishing is optional.
- Finishing is calculated as labor cost plus extra material cost.

---

## GlobalSettings

```ts
export type GlobalSettings = {
  currency: 'BRL'
  electricityCostPerKwh: number
  defaultProfitMarginPercent: number
  defaultFailureRatePercent: number
  defaultLaborHourlyRate: number
  defaultMinimumPrice?: number
}
```

Initial suggested values:

```ts
export const defaultSettings: GlobalSettings = {
  currency: 'BRL',
  electricityCostPerKwh: 0,
  defaultProfitMarginPercent: 40,
  defaultFailureRatePercent: 5,
  defaultLaborHourlyRate: 0,
  defaultMinimumPrice: undefined,
}
```

---

## CostCalculation

Represents a saved historical calculation.

```ts
export type CostCalculation = {
  id: string
  productId?: string
  printProfileId?: string
  name: string
  snapshot: {
    materialName: string
    materialPricePerKg: number
    printerName: string
    printerPowerWatts?: number
    printerPurchasePrice?: number
    printerEstimatedLifetimeHours?: number
    printerMaintenanceCostPerHour?: number
    electricityCostPerKwh: number
    profitMarginPercent: number
    failureRatePercent: number
  }
  input: {
    quantity: number
    printTimeHours: number
    modelWeightGrams: number
    supportWeightGrams: number
    purgeWeightGrams: number
    otherWasteGrams: number
  }
  finishingTasks: FinishingTask[]
  result: {
    materialCost: number
    energyCost: number
    machineCost: number
    maintenanceCost: number
    failureReserveCost: number
    printingCost: number
    finishingCost: number
    totalCost: number
    suggestedPrice: number
    estimatedProfit: number
    realMarginPercent: number
    totalWeightGrams: number
    wasteWeightGrams: number
    wastePercent: number
  }
  createdAt: string
}
```

Rules:

- Must store snapshots.
- Historical calculations must not be recomputed automatically when materials, printers or settings change.
- Recalculation should create a new CostCalculation.
