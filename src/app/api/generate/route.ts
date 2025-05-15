import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { contentWorkflow } from "@/lib/workflows/contentWorkflow";
import { InteractionMemory } from "@/lib/memory/pinecone";
import { KarmaCreditSystem } from "@/lib/karmaCredits";
import { InstagramPlatform } from "@/lib/platforms/instagram";
import { AnalyticsService } from "@/lib/analytics/analyticsService";

const prisma = new PrismaClient();
const memory = new InteractionMemory(process.env.PINECONE_API_KEY || "");
const karmaCredits = new KarmaCreditSystem(prisma);
const analytics = new AnalyticsService(prisma, memory);

export async function POST(request: Request) {
  try {
    const { content, tone, userId } = await request.json();

    // Check user's karma credits
    const credits = await karmaCredits.getCreditBalance(userId);
    if (credits < 1) {
      return NextResponse.json(
        { error: "Insufficient Karma Credits" },
        { status: 402 }
      );
    }

    // Deduct karma credits
    await karmaCredits.deductCredits(userId, 1, "Content Generation");

    // Initialize platforms
    const instagram = new InstagramPlatform(
      prisma,
      memory,
      {
        name: "INSTAGRAM",
        clientId: process.env.INSTAGRAM_CLIENT_ID || "",
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "",
      }
    );

    // Start content generation workflow
    const workflow = await contentWorkflow.start({
      userId,
      content,
    });

    // Track the workflow
    await memory.addInteraction(
      workflow.id,
      userId,
      "Content generation workflow started",
      "system"
    );

    return NextResponse.json({
      workflowId: workflow.id,
      status: "processing",
      message: "Content generation in progress...",
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");
    const userId = searchParams.get("userId");

    if (!workflowId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get workflow status
    const status = await contentWorkflow.getStatus(workflowId);

    // Get analytics if completed
    let analyticsData = null;
    if (status === "completed") {
      analyticsData = await analytics.generateEngagementReport(userId);
    }

    return NextResponse.json({
      workflowId,
      status,
      analytics: analyticsData,
    });
  } catch (error) {
    console.error("Error getting workflow status:", error);
    return NextResponse.json(
      { error: "Failed to get workflow status" },
      { status: 500 }
    );
  }
}
