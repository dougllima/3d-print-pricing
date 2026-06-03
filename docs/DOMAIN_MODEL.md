# Domain Model

## Material

Represents a filament material.

```ts
export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'OTHER';

export type Material = {
  id: string;
  name: string;
  type: MaterialType;
  brand?: string;
  colorName?: string;
  colorHex?: string;
  supplierColorCode?: string;
  pricePerKg: number;
  spoolWeightGrams?: number;
  remainingWeightGrams?: number;
  lowStockThresholdGrams?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Rules:

- `pricePerKg` is required.
- `colorHex` is optional.
- If `colorHex` is provided, validate it as a valid HEX color.
- `spoolWeightGrams` is optional and represents the nominal filament amount in the spool.
- `remainingWeightGrams` is optional and represents the currently available filament amount.
- `lowStockThresholdGrams` is optional and controls low-stock alerts.
- If `spoolWeightGrams` and `remainingWeightGrams` are both provided, `remainingWeightGrams` must not be greater than `spoolWeightGrams`.
- Stock fields are measured in grams.
- Material stock tracking is lightweight in v1.1 and does not include stock movement history.
- Materials should be archived/deactivated instead of permanently deleted when possible.

---

## Printer

Represents an FDM printer.

```ts
export type Printer = {
  id: string;
  name: string;
  model?: string;
  powerWatts?: number;
  purchasePrice?: number;
  estimatedLifetimeHours?: number;
  maintenanceCostPerHour?: number;
  defaultFailureRatePercent?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Rules:

- `powerWatts` is optional.
- If printer depreciation data is missing, machine depreciation cost should be zero.
- If maintenance cost is missing, maintenance cost should be zero.
- `defaultFailureRatePercent` can override global failure rate when present.

---

## Product

Represents a catalog item.

```ts
export type Product = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Rules:

- Product does not store print time, material, weight, slicer settings or finishing.
- Those belong to PrintProfile or CostCalculation.

---

## PrintProfile

Represents a specific way to print a product.

UI name: Impressão / Impressões.

```ts
export type PrintProfile = {
  id: string;

  productId?: string;

  name: string;
  printerId: string;
  materialId: string;

  slicerProfileName?: string;

  layerHeightMm?: number;
  nozzleDiameterMm?: number;
  infillPercent?: number;
  wallLoops?: number;

  printTimeHours: number;

  modelWeightGrams: number;
  supportWeightGrams: number;
  purgeWeightGrams: number;
  otherWasteGrams: number;

  notes?: string;

  isFavorite?: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};
```

Rules:

- `productId` is optional to allow standalone print profiles.
- All weight fields should default to zero except `modelWeightGrams`.
- A product may have multiple print profiles.
- A print profile belongs to one material and one printer.

---

## FinishingTask

Represents an optional finishing step used inside a cost calculation.

```ts
export type FinishingTask = {
  id: string;
  name: string;
  hours: number;
  hourlyRate: number;
  materialCost: number;
};
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
  currency: 'BRL';
  electricityCostPerKwh: number;
  defaultProfitMarginPercent: number;
  defaultFailureRatePercent: number;
  defaultLaborHourlyRate: number;
  defaultMinimumPrice?: number;
};
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
};
```

---

## CostCalculation

Represents a saved historical calculation.

```ts
export type CostCalculation = {
  id: string;

  productId?: string;
  printProfileId?: string;

  name: string;

  snapshot: {
    materialName: string;
    materialPricePerKg: number;
    printerName: string;
    printerPowerWatts?: number;
    printerPurchasePrice?: number;
    printerEstimatedLifetimeHours?: number;
    printerMaintenanceCostPerHour?: number;
    electricityCostPerKwh: number;
    profitMarginPercent: number;
    failureRatePercent: number;
  };

  input: {
    quantity: number;
    printTimeHours: number;
    modelWeightGrams: number;
    supportWeightGrams: number;
    purgeWeightGrams: number;
    otherWasteGrams: number;
  };

  finishingTasks: FinishingTask[];

  result: {
    materialCost: number;
    energyCost: number;
    machineCost: number;
    maintenanceCost: number;
    failureReserveCost: number;
    printingCost: number;
    finishingCost: number;
    totalCost: number;
    suggestedPrice: number;
    estimatedProfit: number;
    realMarginPercent: number;
    totalWeightGrams: number;
    wasteWeightGrams: number;
    wastePercent: number;
  };

  createdAt: string;
};
```

Rules:

- Must store snapshots.
- Historical calculations must not be recomputed automatically when materials, printers or settings change.
- Recalculation should create a new CostCalculation.
