# Life Tracking App - Phased Implementation Plan

## Context

This plan implements a local-first, offline-capable Progressive Web App (PWA) for holistic life tracking. The app will track productivity, finance, physical health, metabolic health, digital wellbeing, mindfulness, and intellectual growth. Starting with manual entry and client-side encryption, it will evolve to include automated data fetching, LLM-powered insights, and cloud backup.

The implementation is broken into 9 phases, each deliverable and testable independently, allowing incremental development without overwhelming scope.

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

## Phase 3: UI Foundation - Layout & Theme

**Goal**: Build responsive layout and design system

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/components/layout.test.ts` — test AppHeader, AppSidebar, AppBottomNav, AppLayout render correctly
     - `src/__tests__/composables/useTheme.test.ts` — test theme toggle, persistence, and CSS class application
     - `src/__tests__/components/ui.test.ts` — test Card, Button, Input, Modal component rendering and props
   - Key test cases:
     - AppLayout renders header on all screen sizes
     - AppSidebar renders nav links for desktop
     - AppBottomNav renders nav items for mobile
     - Theme defaults to dark mode
     - Theme toggle switches between light and dark
     - Theme preference persists to localStorage
     - Card component renders slot content
     - Button component emits click events and renders variants (primary/secondary)
     - Input component binds v-model correctly
     - Modal opens and closes, emits close event
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Create base layout components**
   - `AppHeader.vue` - top navigation/branding
   - `AppSidebar.vue` - desktop navigation
   - `AppBottomNav.vue` - mobile navigation
   - `AppLayout.vue` - responsive wrapper

2. **Implement theme system**
   - Define CSS variables for colors, spacing, typography
   - Create light/dark mode toggle
   - Store theme preference in LocalStorage
   - Apply theme classes globally

3. **Build reusable UI components**
   - `Card.vue` - container for metrics
   - `Button.vue` - primary/secondary variants
   - `Input.vue`, `Select.vue`, `DatePicker.vue`
   - `Modal.vue` - for confirmations and dialogs
   - `LoadingSpinner.vue`, `ErrorMessage.vue`

4. **Design dashboard grid layout**
   - Create responsive grid (1 col mobile, 2-3 cols desktop)
   - Implement "above the fold" KPI cards
   - Add whitespace and visual hierarchy
   - Test on mobile (375px) to desktop (1920px)

5. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Layout adapts smoothly from mobile to desktop
- Theme toggle works and persists across sessions
- Navigation is accessible via keyboard and screen readers
- All components render correctly in isolation

**Files to create**:
- `src/__tests__/components/layout.test.ts`, `src/__tests__/components/ui.test.ts`
- `src/__tests__/composables/useTheme.test.ts`
- `src/components/layout/AppHeader.vue`, `AppSidebar.vue`, `AppBottomNav.vue`, `AppLayout.vue`
- `src/components/ui/Card.vue`, `Button.vue`, `Input.vue`, `Modal.vue`, etc.
- `src/styles/themes.css`
- `src/composables/useTheme.ts`

---

## Phase 4: Manual Entry System - Forms for All Domains

**Goal**: Build data entry forms for all 7 tracking domains

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/components/forms/ProductivityForm.test.ts`
     - `src/__tests__/components/forms/FinanceForm.test.ts`
     - `src/__tests__/components/forms/HealthForm.test.ts`
     - `src/__tests__/components/forms/MetabolicForm.test.ts`
     - `src/__tests__/components/forms/DigitalForm.test.ts`
     - `src/__tests__/components/forms/MindfulnessForm.test.ts`
     - `src/__tests__/components/forms/ReadingForm.test.ts`
     - `src/__tests__/views/Entry.test.ts` — test unified entry view
   - Key test cases:
     - Each form renders all required fields
     - Form submission emits save event with correct data shape
     - Validation prevents submitting with missing required fields
     - Validation rejects out-of-range values (e.g. focus_rating 0 or 6)
     - Date field defaults to today
     - Finance form auto-calculates net worth (assets - liabilities)
     - Entry view renders tab/selector for all 7 domains
     - Can switch between domain forms
     - Edit mode populates form with existing entry data
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Create productivity entry form**
   - Fields: date, tasks planned, tasks completed, focus rating (1-5), deep work hours
   - Add quick-entry shortcuts
   - Implement form validation

2. **Create finance entry form**
   - Fields: date, total assets, total liabilities, net worth (calculated), category spending
   - Support for multiple spending categories
   - Monthly summary calculations

3. **Create health entry form (Fitbit)**
   - Fields: date, resting HR, HRV, sleep duration, sleep stages (REM/Deep/Core), active minutes
   - Visual indicators for "normal" ranges

4. **Create metabolic entry form (Zoe)**
   - Fields: date, gut microbiome score, daily food score, fiber intake, glucose/fat response
   - Add meal-specific scoring

5. **Create digital wellbeing entry form**
   - Fields: date, total screen time, unlocks count, top 3 apps used
   - Weekly summary view

6. **Create mindfulness entry form**
   - Fields: date, meditation type, duration, quality rating (1-5), streak count
   - Practice history calendar

7. **Create reading entry form (Kindle)**
   - Fields: date, book title, pages read, highlights captured
   - Progress tracking for current books

8. **Build unified entry dashboard**
   - Tabbed interface or category selector
   - "Quick add" mode for daily logging
   - "Copy from yesterday" functionality
   - Bulk import support (future)

9. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Can enter data for all 7 domains
- Form validation prevents invalid entries
- Data saves to IndexedDB encrypted
- Can edit and delete existing entries
- Mobile-friendly input (number pads, date pickers)

**Files to create**:
- `src/__tests__/components/forms/*.test.ts` (7 form test files)
- `src/__tests__/views/Entry.test.ts`
- `src/components/forms/ProductivityForm.vue`
- `src/components/forms/FinanceForm.vue`
- `src/components/forms/HealthForm.vue`
- `src/components/forms/MetabolicForm.vue`
- `src/components/forms/DigitalForm.vue`
- `src/components/forms/MindfulnessForm.vue`
- `src/components/forms/ReadingForm.vue`
- `src/views/Entry.vue` - unified entry view

---

## Phase 5: Data Visualization - Charts & Metrics

**Goal**: Display historical data with charts and trend analysis

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/components/charts.test.ts` — test chart wrapper components render with data
     - `src/__tests__/components/metrics.test.ts` — test MetricCard, DeltaIndicator, StreakCounter
     - `src/__tests__/views/Dashboard.test.ts` — test dashboard renders metric cards and charts
     - `src/__tests__/utils/chartConfig.test.ts` — test chart configuration helpers
   - Key test cases:
     - LineChart renders canvas element when given data points
     - BarChart renders with correct number of bars
     - PieChart renders with category data
     - MetricCard displays label, value, and unit
     - DeltaIndicator shows positive (green/↑) and negative (red/↓) changes
     - StreakCounter displays current streak count
     - Time range selector defaults to "Last 7 days"
     - Changing time range updates chart data
     - Dashboard renders one metric card per domain
     - Charts handle empty data gracefully (no crash)
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Install and configure charting library**
   - Install Chart.js (lightweight) or ApexCharts (feature-rich)
   - Create chart wrapper components for consistency
   - Set up responsive chart containers

2. **Create metric cards for dashboard**
   - "Today's Summary" cards showing latest values
   - Delta indicators (↑ 15%, ↓ 8%) with color coding
   - "Streaks" for consistency tracking
   - Quick stats (7-day average, monthly total)

3. **Build domain-specific charts**
   - **Productivity**: Line chart for focus ratings over time, bar chart for task completion
   - **Finance**: Area chart for net worth trend, pie chart for spending categories
   - **Health**: Multi-line chart for HR/HRV, sleep stage stacked bar chart
   - **Metabolic**: Line chart for daily food scores, scatter plot for meals
   - **Digital**: Bar chart for daily screen time, breakdown by app
   - **Mindfulness**: Streak calendar heatmap, duration trend line
   - **Reading**: Progress bars for current books, pages per day chart

4. **Implement time range selectors**
   - Presets: Last 7 days, Last 30 days, Last 90 days, All time
   - Custom date range picker
   - Update all charts when range changes

5. **Add interactivity**
   - Tooltips showing exact values on hover
   - Click to drill down into specific dates
   - Export chart as image (future)

6. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- All charts render with sample data
- Charts update when new data is entered
- Time range selector filters data correctly
- Charts are responsive on mobile
- Performance is smooth even with 1000+ data points

**Files to create**:
- `src/__tests__/components/charts.test.ts`, `src/__tests__/components/metrics.test.ts`
- `src/__tests__/views/Dashboard.test.ts`, `src/__tests__/utils/chartConfig.test.ts`
- `src/components/charts/LineChart.vue`, `BarChart.vue`, `PieChart.vue`, `HeatmapChart.vue`
- `src/components/metrics/MetricCard.vue`, `DeltaIndicator.vue`, `StreakCounter.vue`
- `src/views/Dashboard.vue` - main visualization view
- `src/utils/chartConfig.ts` - shared chart configurations

---

## Phase 6: Aggregation & Insights - Summary Calculations

**Goal**: Calculate daily, weekly, and monthly summaries for performance

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/utils/aggregation.test.ts` — test summary calculation functions
     - `src/__tests__/utils/trends.test.ts` — test trend detection algorithms
     - `src/__tests__/stores/insights.test.ts` — test insights store state management
     - `src/__tests__/views/Insights.test.ts` — test insights view rendering
     - `src/__tests__/components/insights.test.ts` — test ComparisonCard, AnomalyAlert, GoalProgress
   - Key test cases:
     - Daily summary correctly sums/averages values for a given day
     - Weekly rollup aggregates 7 days of data
     - Monthly summary calculates delta % from previous month
     - Moving average (7-day) calculates correctly with sample data
     - Moving average (30-day) handles fewer than 30 data points
     - Anomaly detection flags values >2 std deviations from mean
     - Streak detection counts consecutive days meeting a threshold
     - Significant change detection flags >15% week-over-week delta
     - ComparisonCard renders "this week" vs "last week" values
     - AnomalyAlert renders when anomalies are present, hides when none
     - GoalProgress shows correct percentage toward target
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Create aggregation utilities**
   - Daily summaries (sum, average, median calculations)
   - Weekly rollups (totals, averages, min/max)
   - Monthly summaries (delta %, IQR for financial data)
   - Store pre-calculated summaries in IndexedDB for performance

2. **Build summary tables in IndexedDB**
   - `daily_summaries` - one row per day per domain
   - `weekly_summaries` - rolling 7-day aggregates
   - `monthly_summaries` - calendar month aggregates
   - Auto-update summaries when new data is entered

3. **Implement trend detection**
   - Calculate moving averages (7-day, 30-day)
   - Detect anomalies (values >2 std deviations from mean)
   - Identify streaks (consecutive days meeting goals)
   - Flag significant changes (>15% delta week-over-week)

4. **Create insights view**
   - "This Week vs Last Week" comparison cards
   - Anomaly highlights ("Sleep was unusually low on Tuesday")
   - Correlation hints ("Meditation seems to correlate with better focus")
   - Personal bests ("Longest reading streak: 12 days")

5. **Add goal tracking**
   - Set target values for each metric
   - Visual progress indicators
   - Streak tracking for consistency goals

6. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Summaries calculate correctly for all time ranges
- Summaries update when data changes
- Anomalies are detected and highlighted
- Insights view shows meaningful patterns
- Performance remains fast with large datasets

**Files to create**:
- `src/__tests__/utils/aggregation.test.ts`, `src/__tests__/utils/trends.test.ts`
- `src/__tests__/stores/insights.test.ts`, `src/__tests__/views/Insights.test.ts`
- `src/__tests__/components/insights.test.ts`
- `src/utils/aggregation.ts` - calculation functions
- `src/utils/trends.ts` - trend detection algorithms
- `src/stores/insights.ts` - insights state management
- `src/views/Insights.vue` - insights dashboard
- `src/components/insights/ComparisonCard.vue`, `AnomalyAlert.vue`, `GoalProgress.vue`

---

## Phase 7: LLM Export - Markdown-KV Format

**Goal**: Export data in LLM-optimized format for AI analysis

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/utils/export.test.ts` — test export format generators
     - `src/__tests__/components/export.test.ts` — test ExportModal and PromptLibrary components
     - `src/__tests__/views/Export.test.ts` — test export view rendering
   - Key test cases:
     - Markdown-KV export produces valid markdown with `Day: {Metric: Value}` format
     - Export includes metadata header (date range, units)
     - Export marks anomalies with markers
     - Export filters by selected domains
     - Export filters by date range
     - JSON export produces valid parseable JSON
     - CSV export produces valid CSV with headers
     - ExportModal renders domain selector and date range picker
     - Copy-to-clipboard button copies exported text
     - PromptLibrary renders pre-written prompt suggestions
     - Empty data produces meaningful "no data" export (not crash)
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Implement Markdown-KV export format**
   - Create export utility that generates structured markdown
   - Format: `Day: {Metric: Value, Metric: Value}`
   - Include metadata (date range, units, user goals)
   - Highlight anomalies with markers

2. **Build export UI**
   - Date range selector for export
   - Domain selector (export all or specific domains)
   - Copy to clipboard button
   - Download as .md file

3. **Create export templates**
   - "Weekly Summary" template
   - "Monthly Review" template
   - "Correlation Analysis" template
   - "Custom Query" template

4. **Add prompt suggestions**
   - Pre-written prompts for common analyses
   - Examples:
     - "Analyze correlation between meditation and productivity"
     - "Identify dietary patterns affecting sleep quality"
     - "Suggest schedule optimizations based on focus patterns"

5. **Implement alternative export formats**
   - JSON export for backup/migration
   - CSV export for spreadsheet analysis
   - Markdown table format for GitHub/Notion

6. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Export generates valid markdown that LLMs can parse
- All selected data domains are included
- Anomalies are clearly marked
- Can copy to clipboard and paste into ChatGPT/Claude
- Exported data accurately represents stored data

**Files to create**:
- `src/__tests__/utils/export.test.ts`
- `src/__tests__/components/export.test.ts`, `src/__tests__/views/Export.test.ts`
- `src/utils/export.ts` - export format generators
- `src/components/export/ExportModal.vue`
- `src/components/export/PromptLibrary.vue`
- `src/views/Export.vue` - export interface

---

## Phase 8: Google Drive Backup - Cloud Sync

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

## Phase 9: API Integration - Automated Data Fetching

**Goal**: Replace manual entry with automated API fetching where possible

### Tasks:
0. **Write test cases & confirm they fail (red phase)**
   - Create test files:
     - `src/__tests__/services/fitbit.test.ts` — test Fitbit API client (mocked)
     - `src/__tests__/services/dataSync.test.ts` — test unified sync orchestrator
     - `src/__tests__/utils/apiMappers.test.ts` — test API-to-schema transformers
     - `src/__tests__/stores/apiAuth.test.ts` — test API authentication state
     - `src/__tests__/components/settings/ApiConnections.test.ts` — test API settings UI
   - Key test cases:
     - Fitbit OAuth flow initiates correctly
     - Fitbit API response maps to internal health_logs schema
     - API mapper handles missing/null fields gracefully
     - API mapper rejects malformed API responses
     - Data sync merges API data with existing manual entries
     - Manual entries take priority over API data for same date
     - Scheduled fetch triggers at configured interval
     - Retry logic retries failed fetches with backoff
     - Rate limit handling pauses fetches when limit hit
     - ApiConnections shows connect/disconnect buttons per API
     - ApiConnections shows last sync time per API
     - Disconnecting API removes stored tokens
   - Run `npx vitest run` and confirm all new tests **FAIL**

1. **Implement Fitbit API integration**
   - Set up Fitbit OAuth 2.0 flow
   - Fetch daily summaries (HR, HRV, sleep, steps)
   - Fetch intraday time series (optional)
   - Map API response to data schema
   - Store API tokens securely

2. **Implement data normalization**
   - Create data mappers for each API
   - Convert API formats to internal schema
   - Handle missing data gracefully
   - Merge manual entries with API data

3. **Build API settings UI**
   - Connect/disconnect API integrations
   - View last sync time
   - Manual refresh trigger
   - Data source priority (manual vs API)

4. **Add scheduled fetching**
   - Daily auto-fetch at configured time
   - Retry logic for failed fetches
   - Background sync using service worker
   - Rate limit handling

5. **Implement selective automation**
   - Allow user to choose which domains to automate
   - Keep manual entry option for all domains
   - Show data source in UI (manual vs automated)

6. **Future API integrations (roadmap)**
   - Kindle highlights (via browser extension or email parsing)
   - Monarch Money (unofficial API wrapper)
   - Android Digital Wellbeing (via ADB bridge - advanced)

7. **Verify all tests pass (green phase)**
   - Run `npx vitest run` and confirm all new tests **PASS**
   - Run `npx vue-tsc -b` for type checking
   - Run `npx vite build` for production build

### Verification:
- Can authenticate with Fitbit
- Daily data fetches automatically
- Manual entries still work and take priority
- API errors don't break the app
- Can disconnect APIs and revert to manual entry

**Files to create**:
- `src/__tests__/services/fitbit.test.ts`, `src/__tests__/services/dataSync.test.ts`
- `src/__tests__/utils/apiMappers.test.ts`, `src/__tests__/stores/apiAuth.test.ts`
- `src/__tests__/components/settings/ApiConnections.test.ts`
- `src/services/fitbit.ts` - Fitbit API client
- `src/services/dataSync.ts` - unified sync orchestrator
- `src/utils/apiMappers.ts` - API-to-schema transformers
- `src/components/settings/ApiConnections.vue`
- `src/stores/apiAuth.ts` - API authentication state

---

## Implementation Order Recommendation

**Start with Phases 1-4** to get a functional MVP:
1. ✅ Phase 1: Core infrastructure (PWA works) — **DONE**
2. ✅ Phase 2: Data storage (can save/load data) — **DONE**
3. Phase 3: UI foundation (looks good)
4. Phase 4: Manual entry (can track life)

**Then add value with Phases 5-7**:
5. Phase 5: Visualizations (see trends)
6. Phase 6: Insights (learn from data)
7. Phase 7: LLM export (AI analysis)

**Finally, add convenience with Phases 8-9**:
8. Phase 8: Cloud backup (data safety)
9. Phase 9: API automation (reduce manual work)

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
│   │   └── apiAuth.ts
│   ├── db/
│   │   └── schema.ts
│   ├── services/
│   │   ├── googleDrive.ts
│   │   ├── fitbit.ts
│   │   ├── backup.ts
│   │   └── dataSync.ts
│   ├── utils/
│   │   ├── crypto.ts
│   │   ├── aggregation.ts
│   │   ├── trends.ts
│   │   ├── export.ts
│   │   ├── chartConfig.ts
│   │   └── apiMappers.ts
│   ├── types/
│   │   └── data-models.ts
│   ├── styles/
│   │   ├── variables.css
│   │   └── themes.css
│   └── __tests__/
│       ├── crypto.test.ts
│       ├── db-schema.test.ts
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
- Phase 3: Component rendering, theme toggle, responsive layout
- Phase 4: Form rendering, validation, submission, edit/delete
- Phase 5: Chart rendering, metric display, time range filtering
- Phase 6: Aggregation math, trend detection, anomaly flagging
- Phase 7: Export format generation, clipboard copy, template rendering
- Phase 8: OAuth flow (mocked), backup/restore round-trip, sync status
- Phase 9: API mapping, data merge priority, scheduled fetch, retry logic

**End-to-End Testing**:
1. Fresh install → Set password → Enter week of data
2. View dashboard → Identify trends → Export to LLM
3. Close browser → Reopen → Verify data persists
4. Backup to Drive → Clear browser data → Restore from Drive
5. Connect Fitbit API → Verify automated sync

---

## Security Considerations

- **Master password never stored**: Only derived key kept in memory
- **Encryption at rest**: All IndexedDB data encrypted with AES-GCM
- **No server**: All data stays local or in user's Google Drive
- **HTTPS only**: PWA requires secure context
- **API tokens**: Stored encrypted with same master key
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

- **Phase 1**: ~~1 session (~30-45 min) - Project scaffolding, PWA config~~ ✅ DONE
- **Phase 2**: ~~1-2 sessions (~45-60 min) - Encryption setup, DB schema, testing~~ ✅ DONE
- **Phase 3**: 1 session (~30-45 min) - Layout components, theme system
- **Phase 4**: 2-3 sessions (~90-120 min) - All 7 forms with validation
- **Phase 5**: 2 sessions (~60-90 min) - Chart integration, multiple chart types
- **Phase 6**: 1-2 sessions (~45-60 min) - Aggregation logic, insights UI
- **Phase 7**: 1 session (~30-45 min) - Export utilities, templates
- **Phase 8**: 1-2 sessions (~45-60 min) - Google OAuth, backup/restore
- **Phase 9**: 2-3 sessions per API (~60-90 min) - API integration, data mapping

**Total MVP (Phases 1-7)**: ~9-13 sessions (~8-12 hours total)
**Full version (Phases 1-9)**: ~12-18 sessions (~12-18 hours total)

**Recommended approach**: Implement phases sequentially, test each thoroughly before moving to next. Can complete MVP in 2-3 focused days, full version in 3-5 days.

---

## Success Criteria

✅ **Phase 1**: Can install PWA and navigate offline — **DONE**
✅ **Phase 2**: Data persists encrypted across sessions — **DONE**
- **Phase 3**: UI is responsive and accessible
- **Phase 4**: Can log data for all 7 domains
- **Phase 5**: Can visualize trends with charts
- **Phase 6**: Insights surface meaningful patterns
- **Phase 7**: Export works with LLMs (tested with ChatGPT/Claude)
- **Phase 8**: Backup/restore via Google Drive works
- **Phase 9**: Fitbit data syncs automatically

**Project Success**: Daily use for 30+ days, actionable insights discovered, habits improved based on data
