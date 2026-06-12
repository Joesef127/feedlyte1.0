import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateUnsubscribeToken } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  
  if (!token) {
    return new NextResponse(`
      <html><body style="font-family:system-ui;padding:40px;text-align:center;background:#080808;color:#f0ede8;">
        <h1>Invalid unsubscribe link</h1>
        <p>This link is missing or malformed.</p>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  }
  
  const projectId = await validateUnsubscribeToken(token);
  
  if (!projectId) {
    return new NextResponse(`
      <html><body style="font-family:system-ui;padding:40px;text-align:center;background:#080808;color:#f0ede8;">
        <h1>Invalid or expired link</h1>
        <p>This unsubscribe link is invalid or has expired.</p>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  }
  
  // Disable digest frequency
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { digestFrequency: "none" },
    });
  } catch (err) {
    console.error(`[unsubscribe] Failed to update project ${projectId}:`, err);
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return new NextResponse(`
        <html><body style="font-family:system-ui;padding:40px;text-align:center;background:#080808;color:#f0ede8;">
          <h1>Project not found</h1>
          <p>The project associated with this link no longer exists.</p>
        </body></html>
      `, { status: 404, headers: { "Content-Type": "text/html" } });
    }
    return new NextResponse(`
      <html><body style="font-family:system-ui;padding:40px;text-align:center;background:#080808;color:#f0ede8;">
        <h1>Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </body></html>
    `, { status: 500, headers: { "Content-Type": "text/html" } });
  }
  
  return new NextResponse(`
    <html><body style="font-family:system-ui;padding:40px;text-align:center;background:#080808;color:#f0ede8;">
      <h1>Unsubscribed successfully</h1>
      <p>You will no longer receive daily digest emails for this project.</p>
      <p style="margin-top:24px;color:rgba(240,237,232,0.5);font-size:14px;">
        You can re-enable digests in your project settings.
      </p>
    </body></html>
  `, { headers: { "Content-Type": "text/html" } });
}