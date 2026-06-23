import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionValue,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi." },
      { status: 400 },
    );
  }

  const pengguna = await prisma.pengguna.findUnique({ where: { email } });

  if (!pengguna || pengguna.status !== "Aktif") {
    return NextResponse.json(
      { message: "Email atau password tidak sesuai." },
      { status: 401 },
    );
  }

  if (pengguna.passwordHash !== hashPassword(password)) {
    return NextResponse.json(
      { message: "Email atau password tidak sesuai." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    message: "Login berhasil.",
    pengguna: {
      id: pengguna.id,
      nama: pengguna.nama,
      role: pengguna.role,
      email: pengguna.email,
    },
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionValue(pengguna.id),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
