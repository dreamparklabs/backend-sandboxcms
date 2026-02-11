import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET() {
  try {
    // Initialize Payload - this triggers schema push
    const payload = await getPayload({ config });
    const userCount = await payload.count({ collection: "users" });
    
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected",
      users: userCount.totalDocs
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
