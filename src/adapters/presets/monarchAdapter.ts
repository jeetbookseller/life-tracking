import type { Adapter } from '../registry'

/**
 * Adapter preset for Monarch Money CSV/JSON exports.
 * Maps common Monarch export field names to the internal finance domain schema.
 */
export const monarchAdapter: Adapter = {
  source: 'monarch',
  label: 'Monarch Money',
  domain: 'finance',
  fieldMappings: [
    { externalField: 'Date', internalField: 'date' },
    { externalField: 'date', internalField: 'date' },
    { externalField: 'Total Assets', internalField: 'totalAssets' },
    { externalField: 'total_assets', internalField: 'totalAssets' },
    { externalField: 'Assets', internalField: 'totalAssets' },
    { externalField: 'Total Liabilities', internalField: 'totalLiabilities' },
    { externalField: 'total_liabilities', internalField: 'totalLiabilities' },
    { externalField: 'Liabilities', internalField: 'totalLiabilities' },
    { externalField: 'Net Worth', internalField: 'netWorth' },
    { externalField: 'net_worth', internalField: 'netWorth' },
  ],
}
