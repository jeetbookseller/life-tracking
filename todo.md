# Life Tracking App - Phased Implementation Plan

## Context

This plan implements a local-first, offline-capable Progressive Web App (PWA) for holistic life tracking. The app will track productivity, finance, physical health, metabolic health, digital wellbeing, mindfulness, and intellectual growth. Starting with manual entry and client-side encryption, it will evolve to include universal data ingestion, LLM-powered insights, cloud backup, and optional automated connectors.

The implementation is broken into 10 phases, each deliverable and testable independently, allowing incremental development without overwhelming scope.

**Testing approach**: Every phase follows a TDD (Test-Driven Development) workflow — write tests first, confirm they fail (red), implement the feature, then confirm tests pass (green). The project uses **Vitest** for unit/integration tests and **@vue/test-utils** for component tests.

---

## Technology Stack (from architectural document)

- **Frontend Framework**: Vue 3 with Vite
- **PWA Support**: vite-plugin-pwa
- **State Management**: Pinia
- **Storage**: IndexedDB via Dexie.js
- **Encryption**: Web Crypto API (AES-GCM with PBKDF2)
- **Charts**: Chart.js or ApexCharts
- **Styling**: Modern CSS with CSS custom properties
- **Testing**: Vitest + @vue/test-utils

---

## Phase 1: Project Foundation & Core Infrastructure ✅

**Goal**: Set up development environment, framework, and PWA basics

**Status**: COMPLETED

### Tasks:
1. ~~**Initialize project with Vite + Vue 3**~~
   - ~~Run `npm create vite@latest` and select Vue + TypeScript~~
   - ~~Install core dependencies: `vue`, `vue-router`, `pinia`~~
   - ~~Set up basic project structure: `/src/components`, `/src/views`, `/src/stores`, `/src/utils`~~

2. ~~**Configure PWA support**~~
   - ~~Install `vite-plugin-pwa`~~
   - ~~Create `manifest.webmanifest` with app name, icons, theme colors~~
   - ~~Configure service worker for offline-first caching~~
   - ~~Test PWA installation on mobile and desktop~~

3. ~~**Set up routing structure**~~
   - ~~Create routes: `/dashboard`, `/entry`, `/insights`, `/settings`~~
   - ~~Implement basic navigation layout with sidebar/bottom nav~~
   - ~~Add route guards for future authentication~~

4. ~~**Configure build and dev environment**~~
   - ~~Set up TypeScript strict mode~~
   - ~~Add ESLint and Prettier~~
   - ~~Create development and production build scripts~~
   - ~~Add `.env` support for future API keys~~

### ~~Verification~~:
- ~~App loads in browser~~
- ~~Can install as PWA (Add to Home Screen)~~
- ~~Works offline after initial load~~
- ~~Navigation between routes works smoothly~~

~~**Files created**~~:
- ~~`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`~~
- ~~`src/main.ts`, `src/App.vue`, `src/router/index.ts`, `src/env.d.ts`~~
- ~~`public/manifest.webmanifest`, `public/icons/`, `public/vite.svg`~~
- ~~`src/views/Dashboard.vue`, `src/views/Entry.vue`, `src/views/Insights.vue`, `src/views/Settings.vue`~~
- ~~`src/styles/variables.css`~~
- ~~`eslint.config.js`, `.prettierrc`, `.gitignore`, `.env`~~

---

## Phase 2: Data Layer - Storage & Encryption ✅

**Goal**: Implement IndexedDB storage with encryption at rest

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Install testing infrastructure: `vitest`, `@vue/test-utils`, `jsdom` (this setup carries forward to all subsequent phases)~~
   - ~~Configure `vitest.config.ts` with jsdom environment~~
   - ~~Create test files:~~
     - ~~`src/__tests__/crypto.test.ts` — test `deriveKey`, `encrypt`, `decrypt` functions~~
     - ~~`src/__tests__/db-schema.test.ts` — test Dexie database schema creation and table existence~~
     - ~~`src/__tests__/stores/auth.test.ts` — test master password flow (set password, derive key, lock/unlock)~~
     - ~~`src/__tests__/stores/data.test.ts` — test CRUD operations for all 7 data domains~~
     - ~~`src/__tests__/types/data-models.test.ts` — test TypeScript interfaces compile correctly with valid/invalid data~~
   - ~~Key test cases:~~
     - ~~`deriveKey` produces a CryptoKey from password + salt~~
     - ~~`encrypt` → `decrypt` round-trip returns original data~~
     - ~~Decryption with wrong password throws an error~~
     - ~~Each of the 7 domain tables exists in the Dexie schema~~
     - ~~CRUD: create entry → read it back → update it → delete it~~
     - ~~Entries have UUID and timestamp fields auto-populated~~
     - ~~Validation rejects entries with missing required fields~~
     - ~~Validation rejects out-of-range values (e.g. focus_rating > 5)~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Set up IndexedDB with Dexie.js**~~
   - ~~Install `dexie` and `dexie-export-import`~~
   - ~~Create database schema for all data domains:~~
     - ~~`productivity_logs` (tasks, focus sessions)~~
     - ~~`finance_logs` (net worth, spending by category)~~
     - ~~`health_logs` (Fitbit metrics: HR, HRV, sleep)~~
     - ~~`metabolic_logs` (Zoe scores, food data)~~
     - ~~`digital_logs` (screen time, app usage)~~
     - ~~`mindfulness_logs` (meditation duration, quality)~~
     - ~~`reading_logs` (pages, highlights)~~
   - ~~Add timestamp and UUID to all entries~~

2. ~~**Implement Web Crypto API encryption**~~
   - ~~Create encryption utility functions:~~
     - ~~`deriveKey(password, salt)` using PBKDF2 (600,000 iterations)~~
     - ~~`encrypt(data, key)` using AES-GCM~~
     - ~~`decrypt(encryptedData, key)` using AES-GCM~~
   - ~~Store encrypted data in IndexedDB~~
   - ~~Handle salt generation and storage~~

3. ~~**Create Pinia stores for data management**~~
   - ~~`useAuthStore` - master password management, key derivation~~
   - ~~`useDataStore` - CRUD operations for all data domains~~
   - ~~`useStorageStore` - IndexedDB interaction layer~~
   - ~~Implement reactive queries for UI updates~~

4. ~~**Add data validation schemas**~~
   - ~~Create TypeScript interfaces for each data domain~~
   - ~~Add validation rules (required fields, data types, ranges)~~
   - ~~Implement error handling for storage operations~~

5. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS** (80 tests passing)~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~Can save encrypted data to IndexedDB~~
- ~~Data persists after browser refresh~~
- ~~Can decrypt and read data with correct password~~
- ~~Cannot access data without password~~
- ~~Browser DevTools shows encrypted blobs in IndexedDB~~

~~**Files created**~~:
- ~~`vitest.config.ts` - Vitest configuration~~
- ~~`src/__tests__/setup.ts` - Test setup (fake-indexeddb, Web Crypto polyfill)~~
- ~~`src/__tests__/crypto.test.ts`, `src/__tests__/db-schema.test.ts`~~
- ~~`src/__tests__/stores/auth.test.ts`, `src/__tests__/stores/data.test.ts`~~
- ~~`src/__tests__/types/data-models.test.ts`~~
- ~~`src/db/schema.ts` - Dexie database definition~~
- ~~`src/utils/crypto.ts` - encryption utilities~~
- ~~`src/stores/auth.ts`, `src/stores/data.ts`, `src/stores/storage.ts`~~
- ~~`src/types/data-models.ts` - TypeScript interfaces & validators~~

---

## Phase 3: UI Foundation - Layout & Theme ✅

**Goal**: Build responsive layout and design system

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Create test files:~~
     - ~~`src/__tests__/components/layout.test.ts` — test AppHeader, AppSidebar, AppBottomNav, AppLayout render correctly~~
     - ~~`src/__tests__/composables/useTheme.test.ts` — test theme toggle, persistence, and CSS class application~~
     - ~~`src/__tests__/components/ui.test.ts` — test Card, Button, Input, Modal component rendering and props~~
   - ~~Key test cases:~~
     - ~~AppLayout renders header on all screen sizes~~
     - ~~AppSidebar renders nav links for desktop~~
     - ~~AppBottomNav renders nav items for mobile~~
     - ~~Theme defaults to dark mode~~
     - ~~Theme toggle switches between light and dark~~
     - ~~Theme preference persists to localStorage~~
     - ~~Card component renders slot content~~
     - ~~Button component emits click events and renders variants (primary/secondary)~~
     - ~~Input component binds v-model correctly~~
     - ~~Modal opens and closes, emits close event~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Create base layout components**~~
   - ~~`AppHeader.vue` - top navigation/branding~~
   - ~~`AppSidebar.vue` - desktop navigation~~
   - ~~`AppBottomNav.vue` - mobile navigation~~
   - ~~`AppLayout.vue` - responsive wrapper~~

2. ~~**Implement theme system**~~
   - ~~Define CSS variables for colors, spacing, typography~~
   - ~~Create light/dark mode toggle~~
   - ~~Store theme preference in LocalStorage~~
   - ~~Apply theme classes globally~~

3. ~~**Build reusable UI components**~~
   - ~~`Card.vue` - container for metrics~~
   - ~~`Button.vue` - primary/secondary variants~~
   - ~~`Input.vue`, `Select.vue`, `DatePicker.vue`~~
   - ~~`Modal.vue` - for confirmations and dialogs~~
   - ~~`LoadingSpinner.vue`, `ErrorMessage.vue`~~

4. ~~**Design dashboard grid layout**~~
   - ~~Create responsive grid (1 col mobile, 2-3 cols desktop)~~
   - ~~Implement "above the fold" KPI cards~~
   - ~~Add whitespace and visual hierarchy~~
   - ~~Test on mobile (375px) to desktop (1920px)~~

5. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS**~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~Layout adapts smoothly from mobile to desktop~~
- ~~Theme toggle works and persists across sessions~~
- ~~Navigation is accessible via keyboard and screen readers~~
- ~~All components render correctly in isolation~~

~~**Files created**~~:
- ~~`src/__tests__/components/layout.test.ts`, `src/__tests__/components/ui.test.ts`~~
- ~~`src/__tests__/composables/useTheme.test.ts`~~
- ~~`src/components/layout/AppHeader.vue`, `AppSidebar.vue`, `AppBottomNav.vue`, `AppLayout.vue`~~
- ~~`src/components/ui/Card.vue`, `Button.vue`, `Input.vue`, `Modal.vue`, etc.~~
- ~~`src/styles/themes.css`~~
- ~~`src/composables/useTheme.ts`~~

---

## Phase 4: Manual Entry System - Forms for All Domains ✅

**Goal**: Build data entry forms for all 7 tracking domains

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Create test files:~~
     - ~~`src/__tests__/components/forms/ProductivityForm.test.ts`~~
     - ~~`src/__tests__/components/forms/FinanceForm.test.ts`~~
     - ~~`src/__tests__/components/forms/HealthForm.test.ts`~~
     - ~~`src/__tests__/components/forms/MetabolicForm.test.ts`~~
     - ~~`src/__tests__/components/forms/DigitalForm.test.ts`~~
     - ~~`src/__tests__/components/forms/MindfulnessForm.test.ts`~~
     - ~~`src/__tests__/components/forms/ReadingForm.test.ts`~~
     - ~~`src/__tests__/views/Entry.test.ts` — test unified entry view~~
   - ~~Key test cases:~~
     - ~~Each form renders all required fields~~
     - ~~Form submission emits save event with correct data shape~~
     - ~~Validation prevents submitting with missing required fields~~
     - ~~Validation rejects out-of-range values (e.g. focus_rating 0 or 6)~~
     - ~~Date field defaults to today~~
     - ~~Finance form auto-calculates net worth (assets - liabilities)~~
     - ~~Entry view renders tab/selector for all 7 domains~~
     - ~~Can switch between domain forms~~
     - ~~Edit mode populates form with existing entry data~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Create productivity entry form**~~
   - ~~Fields: date, tasks planned, tasks completed, focus rating (1-5), deep work hours~~
   - ~~Add quick-entry shortcuts~~
   - ~~Implement form validation~~

2. ~~**Create finance entry form**~~
   - ~~Fields: date, total assets, total liabilities, net worth (calculated), category spending~~
   - ~~Support for multiple spending categories~~
   - ~~Monthly summary calculations~~

3. ~~**Create health entry form (Fitbit)**~~
   - ~~Fields: date, resting HR, HRV, sleep duration, sleep stages (REM/Deep/Core), active minutes~~
   - ~~Visual indicators for "normal" ranges~~

4. ~~**Create metabolic entry form (Zoe)**~~
   - ~~Fields: date, gut microbiome score, daily food score, fiber intake, glucose/fat response~~
   - ~~Add meal-specific scoring~~

5. ~~**Create digital wellbeing entry form**~~
   - ~~Fields: date, total screen time, unlocks count, top 3 apps used~~
   - ~~Weekly summary view~~

6. ~~**Create mindfulness entry form**~~
   - ~~Fields: date, meditation type, duration, quality rating (1-5), streak count~~
   - ~~Practice history calendar~~

7. ~~**Create reading entry form (Kindle)**~~
   - ~~Fields: date, book title, pages read, highlights captured~~
   - ~~Progress tracking for current books~~

8. ~~**Build unified entry dashboard**~~
   - ~~Tabbed interface or category selector~~
   - ~~"Quick add" mode for daily logging~~
   - ~~"Copy from yesterday" functionality~~
   - ~~Bulk import support (future)~~

9. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS**~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~Can enter data for all 7 domains~~
- ~~Form validation prevents invalid entries~~
- ~~Data saves to IndexedDB encrypted~~
- ~~Can edit and delete existing entries~~
- ~~Mobile-friendly input (number pads, date pickers)~~

~~**Files created**~~:
- ~~`src/__tests__/components/forms/*.test.ts` (7 form test files)~~
- ~~`src/__tests__/views/Entry.test.ts`~~
- ~~`src/components/forms/ProductivityForm.vue`~~
- ~~`src/components/forms/FinanceForm.vue`~~
- ~~`src/components/forms/HealthForm.vue`~~
- ~~`src/components/forms/MetabolicForm.vue`~~
- ~~`src/components/forms/DigitalForm.vue`~~
- ~~`src/components/forms/MindfulnessForm.vue`~~
- ~~`src/components/forms/ReadingForm.vue`~~
- ~~`src/views/Entry.vue` - unified entry view~~

---

## Phase 5: Data Visualization - Charts & Metrics ✅

**Goal**: Display historical data with charts and trend analysis

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Create test files:~~
     - ~~`src/__tests__/components/charts.test.ts` — test chart wrapper components render with data~~
     - ~~`src/__tests__/components/metrics.test.ts` — test MetricCard, DeltaIndicator, StreakCounter~~
     - ~~`src/__tests__/views/Dashboard.test.ts` — test dashboard renders metric cards and charts~~
     - ~~`src/__tests__/utils/chartConfig.test.ts` — test chart configuration helpers~~
   - ~~Key test cases:~~
     - ~~LineChart renders canvas element when given data points~~
     - ~~BarChart renders with correct number of bars~~
     - ~~PieChart renders with category data~~
     - ~~MetricCard displays label, value, and unit~~
     - ~~DeltaIndicator shows positive (green/↑) and negative (red/↓) changes~~
     - ~~StreakCounter displays current streak count~~
     - ~~Time range selector defaults to "Last 7 days"~~
     - ~~Changing time range updates chart data~~
     - ~~Dashboard renders one metric card per domain~~
     - ~~Charts handle empty data gracefully (no crash)~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Install and configure charting library**~~
   - ~~Install Chart.js (lightweight)~~
   - ~~Create chart wrapper components for consistency~~
   - ~~Set up responsive chart containers~~

2. ~~**Create metric cards for dashboard**~~
   - ~~"Today's Summary" cards showing latest values~~
   - ~~Delta indicators (↑ 15%, ↓ 8%) with color coding~~
   - ~~"Streaks" for consistency tracking~~
   - ~~Quick stats (7-day average, monthly total)~~

3. ~~**Build domain-specific charts**~~
   - ~~**Productivity**: Line chart for focus ratings over time, bar chart for task completion~~
   - ~~**Finance**: Pie chart for spending categories~~
   - ~~**Health**: Multi-line chart for HR/HRV, sleep duration bar chart~~
   - ~~**Digital**: Bar chart for daily screen time~~
   - ~~**Mindfulness**: Duration trend line, streak counter~~
   - ~~**Reading**: Pages per day bar chart~~

4. ~~**Implement time range selectors**~~
   - ~~Presets: Last 7 days, Last 30 days, Last 90 days, All time~~
   - ~~Update all charts when range changes~~

5. ~~**Add interactivity**~~
   - ~~Tooltips showing exact values on hover~~
   - ~~Click to drill down into specific dates~~
   - ~~Export chart as image (future)~~

6. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS** (236 tests)~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~All charts render with sample data~~
- ~~Charts update when new data is entered~~
- ~~Time range selector filters data correctly~~
- ~~Charts are responsive on mobile~~
- ~~Performance is smooth even with 1000+ data points~~

~~**Files created**~~:
- ~~`src/__tests__/components/charts.test.ts`, `src/__tests__/components/metrics.test.ts`~~
- ~~`src/__tests__/views/Dashboard.test.ts`, `src/__tests__/utils/chartConfig.test.ts`~~
- ~~`src/components/charts/LineChart.vue`, `BarChart.vue`, `PieChart.vue`~~
- ~~`src/components/charts/TimeRangeSelector.vue`~~
- ~~`src/components/metrics/MetricCard.vue`, `DeltaIndicator.vue`, `StreakCounter.vue`~~
- ~~`src/views/Dashboard.vue` - main visualization view~~
- ~~`src/utils/chartConfig.ts` - shared chart configurations~~

---

## Phase 6: Aggregation & Insights - Summary Calculations ✅

**Goal**: Calculate daily, weekly, and monthly summaries for performance

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Create test files:~~
     - ~~`src/__tests__/utils/aggregation.test.ts` — test summary calculation functions~~
     - ~~`src/__tests__/utils/trends.test.ts` — test trend detection algorithms~~
     - ~~`src/__tests__/stores/insights.test.ts` — test insights store state management~~
     - ~~`src/__tests__/views/Insights.test.ts` — test insights view rendering~~
     - ~~`src/__tests__/components/insights.test.ts` — test ComparisonCard, AnomalyAlert, GoalProgress~~
   - ~~Key test cases:~~
     - ~~Daily summary correctly sums/averages values for a given day~~
     - ~~Weekly rollup aggregates 7 days of data~~
     - ~~Monthly summary calculates delta % from previous month~~
     - ~~Moving average (7-day) calculates correctly with sample data~~
     - ~~Moving average (30-day) handles fewer than 30 data points~~
     - ~~Anomaly detection flags values >2 std deviations from mean~~
     - ~~Streak detection counts consecutive days meeting a threshold~~
     - ~~Significant change detection flags >15% week-over-week delta~~
     - ~~ComparisonCard renders "this week" vs "last week" values~~
     - ~~AnomalyAlert renders when anomalies are present, hides when none~~
     - ~~GoalProgress shows correct percentage toward target~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Create aggregation utilities**~~
   - ~~Daily summaries (sum, average, median calculations)~~
   - ~~Weekly rollups (totals, averages, min/max)~~
   - ~~Monthly summaries (delta %, IQR for financial data)~~
   - ~~Store pre-calculated summaries in IndexedDB for performance~~

2. ~~**Build summary tables in IndexedDB**~~
   - ~~`daily_summaries` - one row per day per domain~~
   - ~~`weekly_summaries` - rolling 7-day aggregates~~
   - ~~`monthly_summaries` - calendar month aggregates~~
   - ~~Auto-update summaries when new data is entered~~

3. ~~**Implement trend detection**~~
   - ~~Calculate moving averages (7-day, 30-day)~~
   - ~~Detect anomalies (values >2 std deviations from mean)~~
   - ~~Identify streaks (consecutive days meeting goals)~~
   - ~~Flag significant changes (>15% delta week-over-week)~~

4. ~~**Create insights view**~~
   - ~~"This Week vs Last Week" comparison cards~~
   - ~~Anomaly highlights ("Sleep was unusually low on Tuesday")~~
   - ~~Correlation hints ("Meditation seems to correlate with better focus")~~
   - ~~Personal bests ("Longest reading streak: 12 days")~~

5. ~~**Add goal tracking**~~
   - ~~Set target values for each metric~~
   - ~~Visual progress indicators~~
   - ~~Streak tracking for consistency goals~~

6. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS**~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~Summaries calculate correctly for all time ranges~~
- ~~Summaries update when data changes~~
- ~~Anomalies are detected and highlighted~~
- ~~Insights view shows meaningful patterns~~
- ~~Performance remains fast with large datasets~~

~~**Files created**~~:
- ~~`src/__tests__/utils/aggregation.test.ts`, `src/__tests__/utils/trends.test.ts`~~
- ~~`src/__tests__/stores/insights.test.ts`, `src/__tests__/views/Insights.test.ts`~~
- ~~`src/__tests__/components/insights.test.ts`~~
- ~~`src/utils/aggregation.ts` - calculation functions~~
- ~~`src/utils/trends.ts` - trend detection algorithms~~
- ~~`src/stores/insights.ts` - insights state management~~
- ~~`src/views/Insights.vue` - insights dashboard~~
- ~~`src/components/insights/ComparisonCard.vue`, `AnomalyAlert.vue`, `GoalProgress.vue`~~

---

## Phase 7: LLM Export - Markdown-KV Format ✅

**Goal**: Export data in LLM-optimized format for AI analysis

**Status**: COMPLETED

### Tasks:
0. ~~**Write test cases & confirm they fail (red phase)**~~
   - ~~Create test files:~~
     - ~~`src/__tests__/utils/export.test.ts` — test export format generators~~
     - ~~`src/__tests__/components/export.test.ts` — test ExportModal and PromptLibrary components~~
     - ~~`src/__tests__/views/Export.test.ts` — test export view rendering~~
   - ~~Key test cases:~~
     - ~~Markdown-KV export produces valid markdown with `Day: {Metric: Value}` format~~
     - ~~Export includes metadata header (date range, units)~~
     - ~~Export marks anomalies with markers~~
     - ~~Export filters by selected domains~~
     - ~~Export filters by date range~~
     - ~~JSON export produces valid parseable JSON~~
     - ~~CSV export produces valid CSV with headers~~
     - ~~ExportModal renders domain selector and date range picker~~
     - ~~Copy-to-clipboard button copies exported text~~
     - ~~PromptLibrary renders pre-written prompt suggestions~~
     - ~~Empty data produces meaningful "no data" export (not crash)~~
   - ~~Run `npx vitest run` and confirm all new tests **FAIL**~~

1. ~~**Implement Markdown-KV export format**~~
   - ~~Create export utility that generates structured markdown~~
   - ~~Format: `Day: {Metric: Value, Metric: Value}`~~
   - ~~Include metadata (date range, units, user goals)~~
   - ~~Highlight anomalies with markers~~

2. ~~**Build export UI**~~
   - ~~Date range selector for export~~
   - ~~Domain selector (export all or specific domains)~~
   - ~~Copy to clipboard button~~
   - ~~Download as .md file~~

3. ~~**Create export templates**~~
   - ~~"Weekly Summary" template~~
   - ~~"Monthly Review" template~~
   - ~~"Correlation Analysis" template~~
   - ~~"Custom Query" template~~

4. ~~**Add prompt suggestions**~~
   - ~~Pre-written prompts for common analyses~~
   - ~~Examples:~~
     - ~~"Analyze correlation between meditation and productivity"~~
     - ~~"Identify dietary patterns affecting sleep quality"~~
     - ~~"Suggest schedule optimizations based on focus patterns"~~

5. ~~**Implement alternative export formats**~~
   - ~~JSON export for backup/migration~~
   - ~~CSV export for spreadsheet analysis~~
   - ~~Markdown table format for GitHub/Notion~~

6. ~~**Verify all tests pass (green phase)**~~
   - ~~Run `npx vitest run` and confirm all new tests **PASS**~~
   - ~~Run `npx vue-tsc -b` for type checking~~
   - ~~Run `npx vite build` for production build~~

### ~~Verification~~:
- ~~Export generates valid markdown that LLMs can parse~~
- ~~All selected data domains are included~~
- ~~Anomalies are clearly marked~~
- ~~Can copy to clipboard and paste into ChatGPT/Claude~~
- ~~Exported data accurately represents stored data~~

~~**Files created**~~:
- ~~`src/__tests__/utils/export.test.ts`~~
- ~~`src/__tests__/components/export.test.ts`, `src/__tests__/views/Export.test.ts`~~
- ~~`src/utils/export.ts` - export format generators~~
- ~~`src/components/export/ExportModal.vue`~~
- ~~`src/components/export/PromptLibrary.vue`~~
- ~~`src/views/Export.vue` - export interface~~

---

## Phase 8: Universal Data Ingestion - CSV/JSON + Adapters

**Goal**: Ingest exports from any app using a universal import engine with adapter presets, a mapping wizard, and conflict-safe commits

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/utils/dataIngestion.test.ts` — test CSV/JSON parsing and normalization
     - `src/__tests__/adapters/adapterRegistry.test.ts` — test adapter preset lookup and mapping behavior
     - `src/__tests__/services/import.test.ts` — test dry-run and commit orchestration
     - `src/__tests__/components/settings/MappingWizard.test.ts` — test upload/mapping/preview/confirm UI flow
   - Key test cases:
     - Parser accepts CSV with header row, quoted commas, and configurable delimiters
     - Parser accepts JSON array/object export formats and normalizes to row records
     - Format detection chooses CSV vs JSON correctly
     - Adapter registry resolves known presets (e.g., Fitbit, Monarch) by selected source
     - Mapping Wizard supports unknown source files with manual field mapping
     - Mapping preset can be saved and reused for future imports
     - Required-field validation flags missing fields per selected domain
     - Numeric/date coercion reports row-level errors with field names
     - Dry-run preview reports valid/invalid/conflict row counts
     - Conflict policy `replace` overwrites matching existing entries
     - Conflict policy `skip` preserves existing entries
     - Conflict policy `merge` fills missing fields without clobbering populated values
     - Commit only persists rows approved by preview + conflict policy
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Implement universal ingestion parser**
   - Build parser utility for CSV and JSON sources
   - Normalize all source records into a canonical row model
   - Surface parse diagnostics for malformed files

2. **Create adapter registry with known source presets**
   - Define adapter interface that maps external fields to internal schema fields
   - Add preset adapters for common sources (Fitbit, Monarch) as examples
   - Fallback to Mapping Wizard when no preset matches

3. **Implement Mapping Wizard**
   - File upload + source/domain selection
   - UI to map external columns/tags to required domain fields
   - Save mapping presets locally for reuse

4. **Build validation and dry-run preview pipeline**
   - Apply adapter or manual mapping to build domain payloads
   - Validate mapped rows using existing domain validators
   - Show preview summary: valid, invalid, conflicts, and row-level errors

5. **Implement conflict resolution + commit flow**
   - Provide user-selectable strategies: `replace`, `skip`, `merge`
   - Apply selected strategy during commit transaction
   - Commit only rows approved by dry-run step

6. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Can import both CSV and JSON exports from external apps
- Known-source presets auto-map fields with minimal user effort
- Mapping Wizard supports unknown-source files without custom code
- Invalid rows are surfaced before commit with actionable errors
- Dry-run accurately reports valid/invalid/conflict counts
- Replace/skip/merge behavior matches selected strategy
- Imported rows are persisted only after explicit confirmation

**Files to create**:
- `src/__tests__/utils/dataIngestion.test.ts`
- `src/__tests__/adapters/adapterRegistry.test.ts`
- `src/__tests__/services/import.test.ts`
- `src/__tests__/components/settings/MappingWizard.test.ts`
- `src/utils/dataIngestion.ts` - CSV/JSON parsing and normalization helpers
- `src/adapters/registry.ts` - adapter registration and lookup
- `src/adapters/presets/fitbitAdapter.ts`
- `src/adapters/presets/monarchAdapter.ts`
- `src/services/import.ts` - dry-run + commit orchestration and conflict handling
- `src/components/settings/MappingWizard.vue` - universal file mapping UI

---

## Phase 9: Google Drive Backup - Cloud Sync

**Goal**: Implement encrypted cloud backup via Google Drive

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/services/googleDrive.test.ts` — test Drive API wrapper (mocked)
     - `src/__tests__/services/backup.test.ts` — test backup/restore logic
     - `src/__tests__/stores/sync.test.ts` — test sync state management
     - `src/__tests__/components/settings/BackupSettings.test.ts` — test backup UI
   - Key test cases:
     - Google OAuth flow initiates correctly (redirect URL formed)
     - Token storage encrypts tokens before saving
     - Token refresh logic detects expired tokens
     - Backup serializes entire IndexedDB to JSON
     - Backup encrypts JSON with master key before upload
     - Restore decrypts downloaded backup
     - Restore populates IndexedDB from decrypted JSON
     - Sync status updates: idle → syncing → synced / failed
     - BackupSettings shows last backup timestamp
     - BackupSettings shows sync status indicator
     - Offline queue stores pending backups
     - Auto-sync triggers when online event fires
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Set up Google Drive API integration**
   - Create Google Cloud project
   - Enable Google Drive API
   - Set up OAuth 2.0 credentials (Web application)
   - Configure authorized redirect URIs

2. **Implement Google OAuth flow**
   - Install `@googleapis/drive` or use REST API directly
   - Create OAuth login component
   - Handle token storage in LocalStorage (encrypted)
   - Implement token refresh logic

3. **Create backup/restore functionality**
   - Export entire IndexedDB to JSON
   - Encrypt JSON with user's master key
   - Upload to Drive's `appDataFolder` (hidden from user)
   - Auto-backup on schedule (daily, weekly)
   - Manual backup/restore UI

4. **Build sync status UI**
   - "Last backup" timestamp
   - Sync status indicator (synced, syncing, failed)
   - Restore from backup option
   - Conflict resolution (local vs cloud)

5. **Handle offline/online transitions**
   - Queue backups when offline
   - Auto-sync when connection restored
   - Show sync errors gracefully

6. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Can authenticate with Google account
- Backup file appears in Drive's appDataFolder
- Can restore from backup on new device
- Backup is encrypted (cannot read raw file)
- Sync works across browser sessions

**Files to create**:
- `src/__tests__/services/googleDrive.test.ts`, `src/__tests__/services/backup.test.ts`
- `src/__tests__/stores/sync.test.ts`, `src/__tests__/components/settings/BackupSettings.test.ts`
- `src/services/googleDrive.ts` - Drive API wrapper
- `src/services/backup.ts` - backup/restore logic
- `src/components/settings/BackupSettings.vue`
- `src/stores/sync.ts` - sync state management

---

## Phase 10: Automated Connectors (Optional)

**Goal**: Add optional direct connectors for high-frequency sources without making third-party APIs a core requirement

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/services/connectors.test.ts` — test connector plugin interface and lifecycle
     - `src/__tests__/services/connectorScheduler.test.ts` — test optional scheduled sync orchestration
     - `src/__tests__/stores/connectorsAuth.test.ts` — test connector auth/token state
     - `src/__tests__/components/settings/ConnectorSettings.test.ts` — test connector settings UI
   - Key test cases:
     - Connectors can be enabled/disabled independently
     - Connector auth flow starts and disconnect removes stored credentials
     - Connector payloads pass through shared adapter/mapping normalization
     - Connector failures do not block manual entry or universal import workflows
     - Scheduled fetch retries transient failures with backoff
     - Rate-limit handling pauses/resumes connector jobs
     - ConnectorSettings shows connection status and last sync time
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Implement connector plugin framework**
   - Define connector interface (`authorize`, `fetch`, `normalize`, `disconnect`)
   - Register connectors as optional modules
   - Reuse ingestion mapping pipeline where possible

2. **Add initial optional connectors**
   - Prioritize aggregator-style/mobile-friendly connectors (Health Connect, Apple Health bridge)
   - Keep direct web APIs (e.g., Fitbit) as optional plugin implementations
   - Preserve manual and file-ingestion-first workflow as default

3. **Build connector settings UI**
   - Connect/disconnect optional connectors
   - View last sync status and last fetch timestamp
   - Manual refresh trigger per connector

4. **Add optional background scheduling**
   - Configurable fetch intervals for enabled connectors
   - Retry/backoff and rate-limit handling
   - Graceful degradation when connectors are unavailable

5. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- App remains fully functional with connectors disabled
- Enabled connectors can sync and normalize data without breaking existing logs
- Connector failures are isolated and surfaced clearly in settings
- Users can disconnect any connector and fall back to file ingestion/manual entry

**Files to create**:
- `src/__tests__/services/connectors.test.ts`
- `src/__tests__/services/connectorScheduler.test.ts`
- `src/__tests__/stores/connectorsAuth.test.ts`
- `src/__tests__/components/settings/ConnectorSettings.test.ts`
- `src/services/connectors.ts` - connector plugin registry and execution
- `src/services/connectorScheduler.ts` - optional sync scheduler
- `src/stores/connectorsAuth.ts` - connector auth/token state
- `src/components/settings/ConnectorSettings.vue`

---

## Implementation Order Recommendation

**Start with Phases 1-4** to get a functional MVP:
1. ✅ Phase 1: Core infrastructure (PWA works) — **DONE**
2. ✅ Phase 2: Data storage (can save/load data) — **DONE**
3. ✅ Phase 3: UI foundation (looks good) — **DONE**
4. ✅ Phase 4: Manual entry (can track life) — **DONE**

**Then add value with Phases 5-8**:
5. ✅ Phase 5: Visualizations (see trends) — **DONE**
6. ✅ Phase 6: Insights (learn from data) — **DONE**
7. ✅ Phase 7: LLM export (AI analysis) — **DONE**
8. Phase 8: Universal data ingestion (CSV/JSON + adapters)

**Optional upgrades (Phases 9-10)**:
9. Phase 9: Cloud backup (data safety)
10. Phase 10: Optional automated connectors (high-frequency sources)

---

## Critical Files Structure

```
life-tracking/
├── public/
│   ├── manifest.webmanifest
│   └── icons/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── Entry.vue
│   │   ├── Insights.vue
│   │   ├── Export.vue
│   │   └── Settings.vue
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── charts/
│   │   ├── metrics/
│   │   ├── insights/
│   │   ├── export/
│   │   └── settings/
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── data.ts
│   │   ├── storage.ts
│   │   ├── insights.ts
│   │   ├── sync.ts
│   │   └── connectorsAuth.ts
│   ├── db/
│   │   └── schema.ts
│   ├── services/
│   │   ├── googleDrive.ts
│   │   ├── backup.ts
│   │   ├── import.ts
│   │   ├── connectors.ts
│   │   └── connectorScheduler.ts
│   ├── adapters/
│   │   ├── registry.ts
│   │   └── presets/
│   ├── utils/
│   │   ├── crypto.ts
│   │   ├── aggregation.ts
│   │   ├── trends.ts
│   │   ├── export.ts
│   │   ├── chartConfig.ts
│   │   └── dataIngestion.ts
│   ├── types/
│   │   └── data-models.ts
│   ├── styles/
│   │   ├── variables.css
│   │   └── themes.css
│   └── __tests__/
│       ├── crypto.test.ts
│       ├── db-schema.test.ts
│       ├── adapters/
│       ├── stores/
│       ├── components/
│       ├── views/
│       ├── utils/
│       └── services/
├── vitest.config.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Testing Strategy

**Framework**: Vitest (unit/integration) + @vue/test-utils (component tests)

**TDD workflow per phase**:
1. Write test cases targeting the phase's verification criteria
2. Run `npx vitest run` — confirm all new tests **FAIL** (red)
3. Implement the feature code
4. Run `npx vitest run` — confirm all tests **PASS** (green)
5. Refactor if needed, keeping tests green

**Per Phase Testing**:
- Phase 1: ~~Install PWA, work offline, navigate routes~~ ✅
- Phase 2: ~~Crypto round-trip, Dexie CRUD, store operations, validation~~ ✅ (80 tests)
- Phase 3: ~~Component rendering, theme toggle, responsive layout~~ ✅
- Phase 4: ~~Form rendering, validation, submission, edit/delete~~ ✅
- Phase 5: ~~Chart rendering, metric display, time range filtering~~ ✅ (236 tests)
- Phase 6: ~~Aggregation math, trend detection, anomaly flagging~~ ✅
- Phase 7: ~~Export format generation, clipboard copy, template rendering~~ ✅
- Phase 8: CSV/JSON ingestion, adapter presets, mapping wizard, preview conflicts
- Phase 9: OAuth flow (mocked), backup/restore round-trip, sync status
- Phase 10: Connector lifecycle, optional scheduling, retry isolation, fallback behavior

**End-to-End Testing**:
1. Fresh install → Set password → Enter week of data
2. View dashboard → Identify trends → Export to LLM
3. Close browser → Reopen → Verify data persists
4. Backup to Drive → Clear browser data → Restore from Drive
5. Import external CSV/JSON → Verify mapping + conflict-safe commit
6. (Optional) Enable connector → Verify sync without breaking manual/import flows

---

## Security Considerations

- **Master password never stored**: Only derived key kept in memory
- **Encryption at rest**: All IndexedDB data encrypted with AES-GCM
- **No server**: All data stays local or in user's Google Drive
- **HTTPS only**: PWA requires secure context
- **Connector tokens (optional)**: Stored encrypted with same master key
- **No analytics**: Complete privacy, no telemetry

---

## Performance Targets

- **Initial load**: < 2 seconds on 3G
- **PWA install**: < 10 MB total size
- **Chart render**: < 500ms for 90 days of data
- **Form submission**: < 100ms save time
- **Dashboard load**: < 1 second with 1 year of data
- **Export generation**: < 2 seconds for full dataset

---

## Future Enhancements (Post-MVP)

- **Mobile app**: Convert PWA to native app using Capacitor
- **Widgets**: Home screen widgets for quick data entry
- **Wearable sync**: Direct integration with smartwatches
- **Natural language entry**: "I slept 7 hours last night" → parsed entry
- **Local AI models**: Run small LLMs locally for instant insights
- **Data sharing**: Export shareable reports for health professionals
- **Habit predictions**: ML model predicting likelihood of meeting goals

---

## Estimated Timeline (Claude Opus Implementation)

Each phase can be implemented in a single session with Claude Opus, with testing and iteration:

- **Phase 1**: ~~1 session - Project scaffolding, PWA config~~ ✅ DONE
- **Phase 2**: ~~1 session - Encryption setup, DB schema, testing~~ ✅ DONE
- **Phase 3**: ~~1 session - Layout components, theme system~~ ✅ DONE
- **Phase 4**: ~~1 session - All 7 forms with validation~~ ✅ DONE
- **Phase 5**: ~~1 session - Chart integration, multiple chart types~~ ✅ DONE
- **Phase 6**: ~~1 session - Aggregation logic, insights UI~~ ✅ DONE
- **Phase 7**: ~~1 session - Export utilities, templates~~ ✅ DONE
- **Phase 8**: 1 session - Universal parser, adapter registry, mapping wizard
- **Phase 9** (optional): 1 session - Google OAuth, backup/restore
- **Phase 10** (optional): 1 session - optional connector plugins and scheduling

**Total MVP (Phases 1-8)**: ~8 sessions
**Optional upgrades (Phases 9-10)**: ~2 sessions

**Recommended approach**: Implement phases sequentially, test each thoroughly before moving to next.

---

## Success Criteria

✅ **Phase 1**: Can install PWA and navigate offline — **DONE**
✅ **Phase 2**: Data persists encrypted across sessions — **DONE**
✅ **Phase 3**: UI is responsive and accessible — **DONE**
✅ **Phase 4**: Can log data for all 7 domains — **DONE**
✅ **Phase 5**: Can visualize trends with charts — **DONE**
✅ **Phase 6**: Insights surface meaningful patterns — **DONE**
✅ **Phase 7**: Export works with LLMs (tested with ChatGPT/Claude) — **DONE**
- **Phase 8**: Universal import supports CSV/JSON, adapters, and conflict-safe commits
- **Phase 9**: Backup/restore via Google Drive works
- **Phase 10**: Optional connectors can sync data without being required

**Project Success**: Daily use for 30+ days, actionable insights discovered, habits improved based on data
