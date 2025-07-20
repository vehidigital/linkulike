import { NextRequest, NextResponse } from "next/server";
import { utapi } from "@/lib/uploadthing-server";

export async function POST(request: NextRequest) {
  try {
    const { fileKeys } = await request.json();
    
    if (!Array.isArray(fileKeys)) {
      return NextResponse.json({ error: "fileKeys must be an array" }, { status: 400 });
    }

    // Filter out empty/null/undefined keys
    const validKeys = fileKeys.filter((key): key is string => typeof key === 'string' && key.length > 0);
    
    if (validKeys.length === 0) {
      return NextResponse.json({ success: true, message: "No valid keys to delete" });
    }

    const result = await utapi.deleteFiles(validKeys);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
} 