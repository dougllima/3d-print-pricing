# Calculation Rules

## Goal

Calculate the real production cost and suggested selling price of an FDM 3D printed item.

The calculation must separate:

- printing cost;
- finishing cost;
- failure reserve;
- total cost;
- suggested selling price.

## Inputs

Main inputs:

- material price per kg;
- printer power in watts;
- electricity cost per kWh;
- printer purchase price;
- estimated printer lifetime in hours;
- printer maintenance cost per hour;
- print time in hours;
- model weight in grams;
- support weight in grams;
- purge weight in grams;
- other waste weight in grams;
- quantity;
- finishing tasks;
- failure rate percentage;
- profit margin percentage.

## Total weight

```txt
totalWeightGrams =
  modelWeightGrams
+ supportWeightGrams
+ purgeWeightGrams
+ otherWasteGrams
```

For multiple units:

```txt
totalWeightGramsForQuantity = totalWeightGrams * quantity
```

## Waste weight

```txt
wasteWeightGrams =
  supportWeightGrams
+ purgeWeightGrams
+ otherWasteGrams
```

For multiple units:

```txt
wasteWeightGramsForQuantity = wasteWeightGrams * quantity
```

## Waste percentage

```txt
wastePercent =
  wasteWeightGrams / totalWeightGrams * 100
```

If total weight is zero, waste percentage should be zero.

## Material cost

```txt
materialCost =
  totalWeightGramsForQuantity / 1000
* materialPricePerKg
```

## Energy cost

```txt
energyCost =
  printTimeHours
* quantity
* printerPowerWatts / 1000
* electricityCostPerKwh
```

If printer power or electricity cost is missing, energy cost should be zero.

## Machine depreciation cost

```txt
depreciationCostPerHour =
  printerPurchasePrice / printerEstimatedLifetimeHours
```

```txt
machineCost =
  printTimeHours
* quantity
* depreciationCostPerHour
```

If purchase price or lifetime hours are missing, machine cost should be zero.

## Maintenance cost

```txt
maintenanceCost =
  printTimeHours
* quantity
* maintenanceCostPerHour
```

If maintenance cost per hour is missing, maintenance cost should be zero.

## Printing cost

```txt
printingCost =
  materialCost
+ energyCost
+ machineCost
+ maintenanceCost
```

## Finishing cost

Each finishing task:

```txt
taskCost =
  hours * hourlyRate
+ materialCost
```

Total:

```txt
finishingCost = sum(taskCost)
```

For now, finishing task hours are considered total hours for the calculation, not multiplied by quantity automatically.

If the UI later needs per-unit finishing tasks, add an explicit field.

## Failure reserve

```txt
failureReserveCost =
  (printingCost + finishingCost)
* failureRatePercent / 100
```

## Total cost

```txt
totalCost =
  printingCost
+ finishingCost
+ failureReserveCost
```

## Suggested price

Use real margin over final price, not markup over cost.

```txt
suggestedPrice =
  totalCost / (1 - profitMarginPercent / 100)
```

Example:

```txt
totalCost = 60
profitMarginPercent = 40

suggestedPrice = 60 / (1 - 0.4)
suggestedPrice = 100
```

## Estimated profit

```txt
estimatedProfit =
  suggestedPrice - totalCost
```

## Real margin

```txt
realMarginPercent =
  estimatedProfit / suggestedPrice * 100
```

If suggested price is zero, real margin should be zero.

## Minimum price

If `defaultMinimumPrice` is configured and suggested price is lower than it, the UI should show a warning.

Do not silently replace the suggested price unless the user explicitly enables this behavior later.

## Rounding

Business logic should avoid aggressive rounding internally.

UI formatting should handle currency display.

Recommended:

- calculations return raw numbers;
- UI formats BRL currency;
- tests use approximate comparisons where needed.
