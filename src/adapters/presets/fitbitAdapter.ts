import type { Adapter } from '../registry'

/**
 * Adapter preset for Fitbit CSV/JSON exports.
 * Maps common Fitbit export field names to the internal health domain schema.
 */
export const fitbitAdapter: Adapter = {
  source: 'fitbit',
  label: 'Fitbit',
  domain: 'health',
  fieldMappings: [
    { externalField: 'Date', internalField: 'date' },
    { externalField: 'date', internalField: 'date' },
    { externalField: 'Resting Heart Rate', internalField: 'restingHR' },
    { externalField: 'resting_heart_rate', internalField: 'restingHR' },
    { externalField: 'Heart Rate Variability', internalField: 'hrv' },
    { externalField: 'hrv', internalField: 'hrv' },
    { externalField: 'Sleep Duration', internalField: 'sleepDuration' },
    { externalField: 'sleep_duration', internalField: 'sleepDuration' },
    {
      externalField: 'Minutes Fairly Active',
      internalField: 'activeMinutes',
      transform: (val: string) => val,
    },
    {
      externalField: 'Minutes Very Active',
      internalField: 'activeMinutes',
      transform: (val: string) => val,
    },
    { externalField: 'active_minutes', internalField: 'activeMinutes' },
    { externalField: 'Steps', internalField: 'steps' },
    { externalField: 'steps', internalField: 'steps' },
  ],
}
