import { NextResponse } from "next/server";
import { getIndustryChainTree } from "@/lib/reports";

export async function GET() {
  const industry_chains = await getIndustryChainTree();
  return NextResponse.json({ industry_chains });
}
