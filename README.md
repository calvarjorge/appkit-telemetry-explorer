# Telemetry Explorer 🔭

[![Deploy to Databricks (Dev)](https://img.shields.io/badge/Deploy_to_Databricks-Dev-FC4C02?style=for-the-badge&logo=databricks&logoColor=white)](https://accounts.dev.databricks.com/select-workspace?destination_url=%2Fapps%2Finstall%3Frepo_url%3Dhttps%253A%252F%252Fgithub.com%252Fcalvarjorge%252Fappkit-telemetry-explorer%26o%3D3481107950761530%26serve-pr-id%3D1715463-f2e6d)

A Databricks App for exploring your app's OpenTelemetry data — logs, metrics, and traces — stored in Unity Catalog tables.

## What it does 🚀

Point it at your telemetry tables and instantly get:

- **📋 Logs** — Filter by severity, search by text, with color-coded severity badges and direct links to related traces
- **📈 Metrics** — Browse all available metrics, select one, and see its time series chart
- **🔍 Traces** — List spans with duration highlighting, toggle root-span-only view, and click through to a full trace waterfall
- **🌊 Trace Waterfall** — Visualize the parent-child span tree with timing bars, click any span to inspect its attributes, resource, events, and status

## Setup ⚙️

Your app's telemetry lives in three Unity Catalog tables following this naming convention:

| Table | Description |
|-------|-------------|
| `<prefix>_otel_logs` | OpenTelemetry log records |
| `<prefix>_otel_metrics` | OpenTelemetry metric data points |
| `<prefix>_otel_spans` | OpenTelemetry trace spans |

When you open the app, enter your **catalog**, **schema**, and **table prefix** in the header bar. The configuration persists across sessions.

## Development 🛠️

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:8000` with hot reload.

## Deployment

Update `databricks.yml` with your workspace host and SQL warehouse ID, then:

```bash
databricks bundle deploy
```

## Built with

- [Databricks AppKit](https://github.com/databricks/appkit) — Full-stack SDK for Databricks Apps
- React 19 + TypeScript + Tailwind CSS
