# Diff Details

Date : 2025-10-15 18:33:38

Directory /Users/lucaswhelan/nesolagus-suite

Total : 152 files,  23256 codes, 441 comments, 1865 blanks, all 25562 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.claude/settings.local.json](/.claude/settings.local.json) | JSON | 1 | 0 | 0 | 1 |
| [engine/backend/package.json](/engine/backend/package.json) | JSON | 1 | 0 | 0 | 1 |
| [engine/backend/src/config/configLoader.ts](/engine/backend/src/config/configLoader.ts) | TypeScript | 16 | 0 | 1 | 17 |
| [engine/backend/src/controllers/admin.controller.ts](/engine/backend/src/controllers/admin.controller.ts) | TypeScript | 20 | 0 | 3 | 23 |
| [engine/backend/src/controllers/config.controller.ts](/engine/backend/src/controllers/config.controller.ts) | TypeScript | 25 | 4 | 3 | 32 |
| [engine/backend/src/controllers/preview.controller.ts](/engine/backend/src/controllers/preview.controller.ts) | TypeScript | 20 | 0 | 3 | 23 |
| [engine/backend/src/routes/clerkAdmin.routes.ts](/engine/backend/src/routes/clerkAdmin.routes.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [engine/backend/src/routes/config.routes.ts](/engine/backend/src/routes/config.routes.ts) | TypeScript | 1 | 1 | 1 | 3 |
| [engine/backend/src/routes/preview.routes.ts](/engine/backend/src/routes/preview.routes.ts) | TypeScript | 4 | 1 | 1 | 6 |
| [engine/config/clients/default.json](/engine/config/clients/default.json) | JSON | 12 | 0 | 0 | 12 |
| [engine/frontend/package.json](/engine/frontend/package.json) | JSON | 2 | 0 | 0 | 2 |
| [engine/frontend/src/components/Admin/AdminOverview.tsx](/engine/frontend/src/components/Admin/AdminOverview.tsx) | TypeScript JSX | -87 | -2 | -13 | -102 |
| [engine/frontend/src/components/Admin/dashboard/DashboardRenderer.tsx](/engine/frontend/src/components/Admin/dashboard/DashboardRenderer.tsx) | TypeScript JSX | 256 | 0 | 21 | 277 |
| [engine/frontend/src/components/Admin/dashboard/helpers.ts](/engine/frontend/src/components/Admin/dashboard/helpers.ts) | TypeScript | 61 | 0 | 9 | 70 |
| [engine/frontend/src/components/Admin/dashboard/types.ts](/engine/frontend/src/components/Admin/dashboard/types.ts) | TypeScript | 39 | 0 | 8 | 47 |
| [engine/frontend/src/components/Admin/dashboard/useDashboardConfig.ts](/engine/frontend/src/components/Admin/dashboard/useDashboardConfig.ts) | TypeScript | 50 | 0 | 9 | 59 |
| [engine/frontend/src/components/Admin/dashboard/useDashboardData.tsx](/engine/frontend/src/components/Admin/dashboard/useDashboardData.tsx) | TypeScript JSX | 76 | 0 | 15 | 91 |
| [engine/frontend/src/services/clerkApi.ts](/engine/frontend/src/services/clerkApi.ts) | TypeScript | 2 | 0 | 1 | 3 |
| [nesolagus-dashboard/Nesolagus-dashboard/README.md](/nesolagus-dashboard/Nesolagus-dashboard/README.md) | Markdown | 23 | 0 | 14 | 37 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/DASHBOARD\_STRATEGIC\_ANALYSIS.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/DASHBOARD_STRATEGIC_ANALYSIS.md) | Markdown | 399 | 0 | 139 | 538 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/DUAL\_DASHBOARD\_STRATEGY.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/DUAL_DASHBOARD_STRATEGY.md) | Markdown | 630 | 0 | 102 | 732 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/SESSION\_LOG.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/SESSION_LOG.md) | Markdown | 901 | 0 | 248 | 1,149 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/community-intelligence-positioning.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/community-intelligence-positioning.md) | Markdown | 111 | 0 | 43 | 154 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/discovery-recap.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/discovery-recap.md) | Markdown | 129 | 0 | 26 | 155 |
| [nesolagus-dashboard/Nesolagus-dashboard/docs/product-brief.md](/nesolagus-dashboard/Nesolagus-dashboard/docs/product-brief.md) | Markdown | 38 | 0 | 10 | 48 |
| [nesolagus-dashboard/Nesolagus-dashboard/eslint.config.mjs](/nesolagus-dashboard/Nesolagus-dashboard/eslint.config.mjs) | JavaScript | 21 | 0 | 5 | 26 |
| [nesolagus-dashboard/Nesolagus-dashboard/next.config.ts](/nesolagus-dashboard/Nesolagus-dashboard/next.config.ts) | TypeScript | 4 | 1 | 3 | 8 |
| [nesolagus-dashboard/Nesolagus-dashboard/package-lock.json](/nesolagus-dashboard/Nesolagus-dashboard/package-lock.json) | JSON | 7,381 | 0 | 1 | 7,382 |
| [nesolagus-dashboard/Nesolagus-dashboard/package.json](/nesolagus-dashboard/Nesolagus-dashboard/package.json) | JSON | 34 | 0 | 1 | 35 |
| [nesolagus-dashboard/Nesolagus-dashboard/postcss.config.mjs](/nesolagus-dashboard/Nesolagus-dashboard/postcss.config.mjs) | JavaScript | 4 | 0 | 2 | 6 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/data/ct\_towns.geojson](/nesolagus-dashboard/Nesolagus-dashboard/public/data/ct_towns.geojson) | JSON | 0 | 0 | 1 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/data/ct\_zcta\_by\_town.geojson](/nesolagus-dashboard/Nesolagus-dashboard/public/data/ct_zcta_by_town.geojson) | JSON | 0 | 0 | 1 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/data/ct\_zctas.geojson](/nesolagus-dashboard/Nesolagus-dashboard/public/data/ct_zctas.geojson) | JSON | 0 | 0 | 1 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/file.svg](/nesolagus-dashboard/Nesolagus-dashboard/public/file.svg) | XML | 1 | 0 | 0 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/globe.svg](/nesolagus-dashboard/Nesolagus-dashboard/public/globe.svg) | XML | 1 | 0 | 0 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/next.svg](/nesolagus-dashboard/Nesolagus-dashboard/public/next.svg) | XML | 1 | 0 | 0 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/vercel.svg](/nesolagus-dashboard/Nesolagus-dashboard/public/vercel.svg) | XML | 1 | 0 | 0 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/public/window.svg](/nesolagus-dashboard/Nesolagus-dashboard/public/window.svg) | XML | 1 | 0 | 0 | 1 |
| [nesolagus-dashboard/Nesolagus-dashboard/scripts/inspect-xlsx.js](/nesolagus-dashboard/Nesolagus-dashboard/scripts/inspect-xlsx.js) | JavaScript | 38 | 2 | 8 | 48 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/analysis/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/analysis/page.tsx) | TypeScript JSX | 53 | 3 | 12 | 68 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/analytics/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/analytics/page.tsx) | TypeScript JSX | 764 | 3 | 60 | 827 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/\[type\]/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/%5Btype%5D/route.ts) | TypeScript | 53 | 1 | 10 | 64 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/csv/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/csv/route.ts) | TypeScript | 24 | 5 | 5 | 34 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/engagement-metrics/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/engagement-metrics/route.ts) | TypeScript | 24 | 5 | 5 | 34 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/narratives/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/export/narratives/route.ts) | TypeScript | 61 | 0 | 6 | 67 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/media/audio/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/media/audio/route.ts) | TypeScript | 24 | 0 | 2 | 26 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/media/methodology/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/media/methodology/route.ts) | TypeScript | 24 | 0 | 2 | 26 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/metrics/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/metrics/route.ts) | TypeScript | 166 | 11 | 16 | 193 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/models/distribution/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/models/distribution/route.ts) | TypeScript | 57 | 0 | 4 | 61 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/narratives/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/narratives/route.ts) | TypeScript | 86 | 5 | 12 | 103 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/participants/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/participants/route.ts) | TypeScript | 154 | 13 | 12 | 179 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/personas/export/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/personas/export/route.ts) | TypeScript | 68 | 3 | 10 | 81 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/question-breakdown/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/question-breakdown/route.ts) | TypeScript | 118 | 11 | 20 | 149 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/api/rank/priorities/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/api/rank/priorities/route.ts) | TypeScript | 59 | 0 | 3 | 62 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/community-pulse/loading.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/community-pulse/loading.tsx) | TypeScript JSX | 12 | 0 | 1 | 13 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/community-pulse/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/community-pulse/page.tsx) | TypeScript JSX | 394 | 15 | 32 | 441 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/globals.css](/nesolagus-dashboard/Nesolagus-dashboard/src/app/globals.css) | PostCSS | 22 | 0 | 5 | 27 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/layout.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/layout.tsx) | TypeScript JSX | 29 | 0 | 4 | 33 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/not-found.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/not-found.tsx) | TypeScript JSX | 16 | 0 | 1 | 17 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/page.tsx) | TypeScript JSX | 516 | 12 | 23 | 551 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/\[id\]/email/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/%5Bid%5D/email/page.tsx) | TypeScript JSX | 461 | 9 | 17 | 487 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/\[id\]/prospects/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/%5Bid%5D/prospects/page.tsx) | TypeScript JSX | 433 | 17 | 24 | 474 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/personas/page.tsx) | TypeScript JSX | 659 | 26 | 31 | 716 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/print/layout.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/print/layout.tsx) | TypeScript JSX | 27 | 1 | 3 | 31 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/print/report/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/print/report/page.tsx) | TypeScript JSX | 279 | 10 | 22 | 311 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/reports/loading.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/reports/loading.tsx) | TypeScript JSX | 12 | 0 | 1 | 13 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/reports/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/reports/page.tsx) | TypeScript JSX | 111 | 0 | 14 | 125 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/robots.txt/route.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/app/robots.txt/route.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/settings/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/settings/page.tsx) | TypeScript JSX | 1,070 | 10 | 54 | 1,134 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/splash-page-backup.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/splash-page-backup.tsx) | TypeScript JSX | 165 | 7 | 12 | 184 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/splash/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/splash/page.tsx) | TypeScript JSX | 184 | 7 | 17 | 208 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/strategic-plan/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/strategic-plan/page.tsx) | TypeScript JSX | 445 | 10 | 21 | 476 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/app/zzz/page.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/app/zzz/page.tsx) | TypeScript JSX | 3 | 0 | 1 | 4 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ChartFunnel.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ChartFunnel.tsx) | TypeScript JSX | 29 | 2 | 4 | 35 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ClientThemeVars.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ClientThemeVars.tsx) | TypeScript JSX | 17 | 2 | 6 | 25 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/DownloadPDF.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/DownloadPDF.tsx) | TypeScript JSX | 11 | 0 | 2 | 13 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/SpectrumDonut.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/SpectrumDonut.tsx) | TypeScript JSX | 24 | 2 | 5 | 31 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/LoginWidget.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/LoginWidget.tsx) | TypeScript JSX | 95 | 65 | 9 | 169 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/MONOREPO\_USAGE.md](/nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/MONOREPO_USAGE.md) | Markdown | 206 | 0 | 49 | 255 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/README.md](/nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/README.md) | Markdown | 169 | 0 | 55 | 224 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/index.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/components/auth/index.ts) | TypeScript | 1 | 5 | 2 | 8 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ghac-dashboard.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ghac-dashboard.tsx) | TypeScript JSX | 80 | 8 | 7 | 95 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/maps/CTMap.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/maps/CTMap.tsx) | TypeScript JSX | 66 | 2 | 8 | 76 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/maps/CTParticipantMap.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/maps/CTParticipantMap.tsx) | TypeScript JSX | 244 | 16 | 18 | 278 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/print/AutoPrint.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/print/AutoPrint.tsx) | TypeScript JSX | 11 | 0 | 4 | 15 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/ClientThemeVars.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/ClientThemeVars.tsx) | TypeScript JSX | 26 | 5 | 6 | 37 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/app-header.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/app-header.tsx) | TypeScript JSX | 18 | 1 | 3 | 22 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/community-spectrum.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/community-spectrum.tsx) | TypeScript JSX | 71 | 0 | 5 | 76 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/engagement-funnel.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/engagement-funnel.tsx) | TypeScript JSX | 65 | 4 | 9 | 78 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/global-header.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/global-header.tsx) | TypeScript JSX | 37 | 3 | 4 | 44 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/gradient-bar.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/gradient-bar.tsx) | TypeScript JSX | 39 | 0 | 4 | 43 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/primary-button.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/primary-button.tsx) | TypeScript JSX | 31 | 5 | 6 | 42 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/sidebar.tsx](/nesolagus-dashboard/Nesolagus-dashboard/src/components/ui/sidebar.tsx) | TypeScript JSX | 127 | 11 | 9 | 147 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/archetype\_models.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/archetype_models.json) | JSON | 106 | 0 | 2 | 108 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/archetype\_rules.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/archetype_rules.json) | JSON | 6 | 0 | 2 | 8 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/archetypes.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/archetypes.json) | JSON | 18 | 0 | 2 | 20 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/client.config.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/client.config.json) | JSON | 11 | 0 | 1 | 12 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/methodology.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/methodology.json) | JSON | 6 | 0 | 2 | 8 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/metrics.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/metrics.json) | JSON | 21 | 0 | 1 | 22 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/narratives-export.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/narratives-export.json) | JSON | 398 | 0 | 0 | 398 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/themes.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/themes.json) | JSON | 6 | 0 | 2 | 8 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/zip\_centroids.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/data/zip_centroids.ts) | TypeScript | 26 | 1 | 2 | 29 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/data/zip\_to\_city.json](/nesolagus-dashboard/Nesolagus-dashboard/src/data/zip_to_city.json) | JSON | 64 | 0 | 1 | 65 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/lib/comprehensive-xlsx-parser.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/lib/comprehensive-xlsx-parser.ts) | TypeScript | 262 | 26 | 55 | 343 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/lib/data.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/lib/data.ts) | TypeScript | 125 | 6 | 8 | 139 |
| [nesolagus-dashboard/Nesolagus-dashboard/src/lib/xlsx-parser.ts](/nesolagus-dashboard/Nesolagus-dashboard/src/lib/xlsx-parser.ts) | TypeScript | 135 | 3 | 30 | 168 |
| [nesolagus-dashboard/Nesolagus-dashboard/tsconfig.json](/nesolagus-dashboard/Nesolagus-dashboard/tsconfig.json) | JSON with Comments | 43 | 0 | 1 | 44 |
| [package-lock.json](/package-lock.json) | JSON | 32 | 0 | 0 | 32 |
| [package.json](/package.json) | JSON | 2 | 0 | 0 | 2 |
| [packages/config/README.md](/packages/config/README.md) | Markdown | 30 | 0 | 12 | 42 |
| [packages/config/package.json](/packages/config/package.json) | JSON | 23 | 0 | 1 | 24 |
| [packages/dashboard-widgets/package.json](/packages/dashboard-widgets/package.json) | JSON | 29 | 0 | 1 | 30 |
| [packages/dashboard-widgets/src/components/FunnelChart.tsx](/packages/dashboard-widgets/src/components/FunnelChart.tsx) | TypeScript JSX | 92 | 0 | 12 | 104 |
| [packages/dashboard-widgets/src/components/InsightHighlight.tsx](/packages/dashboard-widgets/src/components/InsightHighlight.tsx) | TypeScript JSX | 93 | 0 | 9 | 102 |
| [packages/dashboard-widgets/src/components/KpiStatCard.tsx](/packages/dashboard-widgets/src/components/KpiStatCard.tsx) | TypeScript JSX | 159 | 0 | 5 | 164 |
| [packages/dashboard-widgets/src/components/SegmentDonut.tsx](/packages/dashboard-widgets/src/components/SegmentDonut.tsx) | TypeScript JSX | 94 | 0 | 12 | 106 |
| [packages/dashboard-widgets/src/index.ts](/packages/dashboard-widgets/src/index.ts) | TypeScript | 9 | 0 | 1 | 10 |
| [packages/dashboard-widgets/src/theme.ts](/packages/dashboard-widgets/src/theme.ts) | TypeScript | 38 | 0 | 4 | 42 |
| [packages/dashboard-widgets/tsconfig.build.json](/packages/dashboard-widgets/tsconfig.build.json) | JSON | 10 | 0 | 1 | 11 |
| [packages/dashboard-widgets/tsconfig.json](/packages/dashboard-widgets/tsconfig.json) | JSON with Comments | 16 | 0 | 1 | 17 |
| [scripts/deploy-client.sh](/scripts/deploy-client.sh) | Shell Script | 5 | 0 | 1 | 6 |
| [scripts/generate.js](/scripts/generate.js) | JavaScript | 10 | 0 | 1 | 11 |
| [scripts/validate.js](/scripts/validate.js) | JavaScript | 39 | 0 | 7 | 46 |
| [studio/app/api/drafts/\[id\]/preview-data/route.ts](/studio/app/api/drafts/%5Bid%5D/preview-data/route.ts) | TypeScript | 73 | 0 | 10 | 83 |
| [studio/app/api/drafts/\[id\]/route.ts](/studio/app/api/drafts/%5Bid%5D/route.ts) | TypeScript | 15 | 0 | 0 | 15 |
| [studio/app/dashboard/\[id\]/page.tsx](/studio/app/dashboard/%5Bid%5D/page.tsx) | TypeScript JSX | 103 | 0 | 10 | 113 |
| [studio/components/dashboard/CanvasWidgetPreview.tsx](/studio/components/dashboard/CanvasWidgetPreview.tsx) | TypeScript JSX | 113 | 0 | 10 | 123 |
| [studio/components/dashboard/DashboardEditor.tsx](/studio/components/dashboard/DashboardEditor.tsx) | TypeScript JSX | 219 | 5 | 20 | 244 |
| [studio/components/dashboard/WidgetInspector.tsx](/studio/components/dashboard/WidgetInspector.tsx) | TypeScript JSX | 324 | 0 | 25 | 349 |
| [studio/components/dashboard/catalog.ts](/studio/components/dashboard/catalog.ts) | TypeScript | 165 | 0 | 10 | 175 |
| [studio/components/dashboard/palette.ts](/studio/components/dashboard/palette.ts) | TypeScript | 34 | 0 | 3 | 37 |
| [studio/components/flow/AIRegenerationPanel.tsx](/studio/components/flow/AIRegenerationPanel.tsx) | TypeScript JSX | 172 | 3 | 21 | 196 |
| [studio/components/flow/BlockEditPanel.tsx](/studio/components/flow/BlockEditPanel.tsx) | TypeScript JSX | 160 | 2 | 16 | 178 |
| [studio/components/flow/BlockTypeSelector.tsx](/studio/components/flow/BlockTypeSelector.tsx) | TypeScript JSX | 90 | 0 | 9 | 99 |
| [studio/components/flow/ConditionalLogicBuilder.tsx](/studio/components/flow/ConditionalLogicBuilder.tsx) | TypeScript JSX | 257 | 3 | 23 | 283 |
| [studio/components/flow/FlowEditor.tsx](/studio/components/flow/FlowEditor.tsx) | TypeScript JSX | 94 | 7 | 20 | 121 |
| [studio/components/flow/editors/ChoiceEditor.tsx](/studio/components/flow/editors/ChoiceEditor.tsx) | TypeScript JSX | 139 | 0 | 14 | 153 |
| [studio/components/flow/editors/MessageEditor.tsx](/studio/components/flow/editors/MessageEditor.tsx) | TypeScript JSX | 71 | 0 | 7 | 78 |
| [studio/components/flow/editors/ScaleEditor.tsx](/studio/components/flow/editors/ScaleEditor.tsx) | TypeScript JSX | 70 | 0 | 7 | 77 |
| [studio/components/flow/editors/TextInputEditor.tsx](/studio/components/flow/editors/TextInputEditor.tsx) | TypeScript JSX | 54 | 0 | 6 | 60 |
| [studio/components/flow/layout.ts](/studio/components/flow/layout.ts) | TypeScript | 157 | 25 | 25 | 207 |
| [studio/components/generation/GeneratedSurveyView.tsx](/studio/components/generation/GeneratedSurveyView.tsx) | TypeScript JSX | 86 | 4 | 5 | 95 |
| [studio/components/ui/select.tsx](/studio/components/ui/select.tsx) | TypeScript JSX | 145 | 0 | 14 | 159 |
| [studio/components/ui/sheet.tsx](/studio/components/ui/sheet.tsx) | TypeScript JSX | 124 | 0 | 15 | 139 |
| [studio/components/ui/switch.tsx](/studio/components/ui/switch.tsx) | TypeScript JSX | 24 | 0 | 4 | 28 |
| [studio/design-document.md](/studio/design-document.md) | Markdown | 11 | 0 | 1 | 12 |
| [studio/package.json](/studio/package.json) | JSON | 2 | 0 | 0 | 2 |
| [studio/src/pipeline/index.js](/studio/src/pipeline/index.js) | JavaScript | 31 | 9 | 8 | 48 |
| [studio/src/pipeline/steps/convertToEngineFormat.js](/studio/src/pipeline/steps/convertToEngineFormat.js) | JavaScript | 10 | 4 | 8 | 22 |
| [studio/src/pipeline/steps/draftQuestions.js](/studio/src/pipeline/steps/draftQuestions.js) | JavaScript | 27 | 0 | 1 | 28 |
| [studio/src/pipeline/steps/generateSurveyDirect.js](/studio/src/pipeline/steps/generateSurveyDirect.js) | JavaScript | 406 | 7 | 36 | 449 |
| [studio/src/pipeline/steps/structureToConfig.js](/studio/src/pipeline/steps/structureToConfig.js) | JavaScript | 1 | 14 | 13 | 28 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details