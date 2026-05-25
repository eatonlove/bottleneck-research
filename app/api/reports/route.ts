import { NextResponse } from "next/server";
import { createReport, getPublishedReports } from "@/lib/reports";
import { ValidationError } from "@/lib/report-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reports = await getPublishedReports(searchParams.get("q") ?? undefined);
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createReport(body, request.headers);
    const absoluteUrl = new URL(result.url, request.url).toString();

    return NextResponse.json(
      {
        ...result,
        url: absoluteUrl
      },
      { status: result.duplicate ? 200 : 201 }
    );
  } catch (error) {
    const status =
      error instanceof ValidationError
        ? error.status
        : typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : 500;

    const message =
      error instanceof Error ? error.message : "报告提交失败，请稍后再试";

    return NextResponse.json(
      {
        error: message
      },
      { status: Number.isFinite(status) ? status : 500 }
    );
  }
}
