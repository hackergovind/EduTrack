import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 to avoid user enumeration attacks
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Delete any existing reset token for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    });

    // Store new token
    await prisma.verificationToken.create({
      data: {
        identifier: `password-reset:${email}`,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // In production you'd send an email here.
    // For local dev we return the URL directly so it can be shown in the UI.
    return NextResponse.json({ message: "Reset link generated.", resetUrl });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
