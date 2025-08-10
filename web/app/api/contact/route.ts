import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactTemplate } from "@/emails/ContactTemplate";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let email = "";
    let phone = "";
    let message = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      name = body.name || "";
      email = body.email || "";
      phone = body.phone || "";
      message = body.message || "";
    } else {
      const form = await request.formData();
      name = String(form.get("name") || "");
      email = String(form.get("email") || "");
      phone = String(form.get("phone") || "");
      message = String(form.get("message") || "");
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "hello@patofalltrades.co.uk";
    const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Pat Of All Trades <onboarding@resend.dev>";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New enquiry from ${name}`,
      react: ContactTemplate({ name, email, phone, message }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}


