import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const overviewRows = [
  { Field: "Project", Value: "AEGIS (Working Title)" },
  {
    Field: "Platform",
    Value: "Cross-platform mobile (iOS/Android) and web application",
  },
  {
    Field: "Vision",
    Value:
      "AI-driven operating system for life that unifies tasks, health, finance, and deep-work.",
  },
  {
    Field: "Primary Agent",
    Value:
      "Chameleon AI with dynamic personas and multi-intent natural language routing.",
  },
  {
    Field: "Core Ledger",
    Value: "MongoDB ActionLogs collection for unified activity timeline.",
  },
];

const techStackRows = [
  {
    Layer: "Monorepo Strategy",
    Technology: "Turborepo",
    Purpose: "Shares types, UI components, and API logic across Web and Mobile.",
  },
  {
    Layer: "Web Frontend",
    Technology: "Next.js (App Router), Tailwind, Zustand",
    Purpose: "SEO-friendly dashboards and complex sprint planning interfaces.",
  },
  {
    Layer: "Mobile Client",
    Technology: "React Native, Expo, NativeWind",
    Purpose: "Cross-platform iOS/Android deployment with native OS integrations.",
  },
  {
    Layer: "Backend API",
    Technology: "Next.js API Routes",
    Purpose: "Serverless execution of standard CRUD operations and database reads.",
  },
  {
    Layer: "Real-Time Engine",
    Technology: "Node.js / Socket.io",
    Purpose: "Manages live leaderboards, activity feeds, and challenge updates.",
  },
  {
    Layer: "Primary Database",
    Technology: "MongoDB",
    Purpose:
      "Document-based structure to handle polymorphic action logs dynamically.",
  },
  {
    Layer: "AI Infrastructure",
    Technology: "Llama 3 (8B) / Ollama / Groq",
    Purpose: "Secure text-to-JSON routing for voice and task orchestration.",
  },
  {
    Layer: "Vision API",
    Technology: "Gemini Flash / Claude",
    Purpose: "Image-to-text tasks such as meal and receipt scanning.",
  },
];

const coreFeaturesRows = [
  {
    Feature: "Chameleon AI Agent",
    Description:
      "Instant voice access, dynamic personas, and multi-intent command routing.",
  },
  {
    Feature: "Unified Task and Sprint Engine",
    Description:
      "Goal decomposition into micro-tasks, household sync, and automated rollover.",
  },
  {
    Feature: "Holistic Health and Fitness",
    Description:
      "Vision-based meal logging and fitness ledger for workouts and cardio.",
  },
  {
    Feature: "Doom Protocol",
    Description:
      "OS-level app blocking, IDE integration logs, and high-stakes cognitive barriers.",
  },
  {
    Feature: "Financial Ledger and Social Arena",
    Description:
      "Voice expense logging, productivity RPG score, and real-time social activity feed.",
  },
];

const milestonesRows = [
  {
    Phase: "Phase 1",
    Timeline: "Weeks 1-4",
    Focus: "Core Loop",
    Deliverables:
      "Initialize Turborepo with Next.js and Expo; set up MongoDB schemas and task/expense routing.",
  },
  {
    Phase: "Phase 2",
    Timeline: "Weeks 5-8",
    Focus: "Deep Work and Social Engine",
    Deliverables:
      "Implement WakaTime/GitHub webhooks and live productivity score activity stream.",
  },
  {
    Phase: "Phase 3",
    Timeline: "Weeks 9-12",
    Focus: "Native Integrations",
    Deliverables:
      "Integrate Vision AI and build custom screen-time blocking modules.",
  },
];

const actionDomainRows = [
  { Domain: "TASK", Purpose: "Task and sprint activity" },
  { Domain: "EXPENSE", Purpose: "Financial tracking and budgeting" },
  { Domain: "FITNESS", Purpose: "Workout and cardio logging" },
  { Domain: "DEEP_WORK", Purpose: "Focus sessions and distraction enforcement" },
];

function setColumnWidths(sheet: XLSX.WorkSheet, widthList: number[]) {
  sheet["!cols"] = widthList.map((wch) => ({ wch }));
}

export async function GET() {
  const workbook = XLSX.utils.book_new();

  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
  setColumnWidths(overviewSheet, [24, 95]);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  const techStackSheet = XLSX.utils.json_to_sheet(techStackRows);
  setColumnWidths(techStackSheet, [24, 34, 78]);
  XLSX.utils.book_append_sheet(workbook, techStackSheet, "TechStack");

  const coreFeaturesSheet = XLSX.utils.json_to_sheet(coreFeaturesRows);
  setColumnWidths(coreFeaturesSheet, [35, 90]);
  XLSX.utils.book_append_sheet(workbook, coreFeaturesSheet, "CoreFeatures");

  const milestonesSheet = XLSX.utils.json_to_sheet(milestonesRows);
  setColumnWidths(milestonesSheet, [12, 14, 34, 90]);
  XLSX.utils.book_append_sheet(workbook, milestonesSheet, "Milestones");

  const domainSheet = XLSX.utils.json_to_sheet(actionDomainRows);
  setColumnWidths(domainSheet, [18, 60]);
  XLSX.utils.book_append_sheet(workbook, domainSheet, "ActionDomains");

  const fileData = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer;

  return new NextResponse(fileData, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="aegis-prd.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}