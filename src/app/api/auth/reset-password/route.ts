import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Token, email, and new password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Look up the token
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: `password-reset:${email}`,
        token,
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
