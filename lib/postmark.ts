import { ServerClient } from "postmark";

const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;

export const postmark = POSTMARK_API_KEY ? new ServerClient(POSTMARK_API_KEY) : null;

export async function sendOtpMail({ to, code }: { to: string; code: string }) {
  if (!postmark) throw new Error("Postmark not configured");
  return postmark.sendEmail({
    From: "noreply@linkulike.com",
    To: to,
    Subject: "Your Linkulike Verification Code",
    HtmlBody: `<h2>Verify your account</h2><p>Your code: <b>${code}</b></p><p>This code is valid for 30 minutes.</p>`
  });
} 