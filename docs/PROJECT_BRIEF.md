# Project Brief

## Name

3D Print Pricing

## Goal

Create a web MVP to calculate prices and real production costs of FDM 3D printed products.

The app should help the user:

- calculate prices for individual printed parts;
- understand real production cost;
- avoid waste and incorrect pricing;
- maintain a catalog of products;
- maintain a catalog of materials;
- track remaining filament quantity for materials;
- maintain a catalog of printers;
- save reusable print profiles;
- save historical cost calculations.

## Target user

Personal use by the project owner.

The app does not need customers, login, PDF export, invoices, or formal quotes in MVP v1.

## MVP scope

Included:

- FDM only.
- Material registration.
- Basic material stock tracking.
- Printer registration.
- Global settings.
- Product registration.
- Print profile registration.
- New calculation flow.
- Optional finishing tasks.
- Detailed cost breakdown.
- Suggested selling price.
- Local calculation history.
- localStorage persistence through an abstraction layer.
- Unit tests for calculation rules.

Not included in MVP v1:

- Resin printing.
- Customer management.
- Backend.
- Login.
- PDF generation.
- Full inventory control with stock movements.
- Charts.
- Formal quote generation.
- Copy-to-clipboard quote button.

## Main concepts

### Material

A specific filament spool/type, including brand, type, color, price per kg and optional stock information.

Material stock tracking is intentionally lightweight in v1.1. It helps the user know whether there is enough filament available before printing, but it is not a complete inventory system.

### Printer

A physical FDM printer used to calculate energy, depreciation and maintenance costs.

### Product

A catalog item. It does not directly store material, slicer settings, print time or weight.

Products may have multiple categories. Category options are derived from categories already used by products.

### PrintProfile

A specific way to manufacture a product. In the UI, this should be called "Impressao" or "Impressoes".

A product can have multiple print profiles. Each print profile may contain multiple quantity-specific print runs and each run may use one or more materials.

Print run weight and time values come from slicer totals for that quantity and must not be multiplied by quantity again.

### CostCalculation

A saved calculation result. It must store snapshots of the values used at calculation time.

### MaterialStock

Material stock data belongs to Material in v1.1.

It should track:

- nominal spool weight;
- remaining filament weight;
- low stock threshold.

The app should warn when a calculation may require more material than the remaining stock.

Saving a calculation should not automatically reduce material stock in v1.1. Automatic consumption should be explicit in a future version.

## UI language

Use Portuguese for user-facing labels.

Examples:

- Materiais
- Impressoras
- Produtos
- Impressoes
- Novo calculo
- Historico
- Configuracoes
- Custo de impressao
- Custo de acabamento
- Preco sugerido

## Code language

Use English for code.

Examples:

- `Material`
- `Printer`
- `Product`
- `PrintProfile`
- `CostCalculation`
- `calculateCost`
- `materialRepository`
