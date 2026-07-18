export { getSupabaseClient, isSupabaseConfigured } from './client';
export {
  searchPropertiesFromSupabase,
  getPropertyByIdFromSupabase,
  submitReportToSupabase,
  fetchLocationSuggestions,
} from './queries';
export type { SubmitReportInput, SubmitReportResult } from './queries';
export type { PropertyRow, ReportRow, Database } from './database.types';
export { ACCESSIBILITY_COLUMN_MAP, rowToListing } from './mappers';
