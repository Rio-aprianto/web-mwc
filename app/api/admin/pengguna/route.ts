import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

import {
  fromActiveStatus,
  fromPenggunaRole,
  toActiveStatus,
  toPenggunaRole,
} from "../_utils/mappers";

export async function GET() {
  const items = await prisma.pengguna.findMany({ orderBy: { id: "desc" } });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      nama: item.nama,
      role: fromPenggunaRole(item.role),
      email: item.email,
      status: fromActiveStatus(item.status),
    })),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nama?: string;
    role?: string;
    email?: string;
    password?: string;
    status?: string;
  };

  if (!body.nama || !body.email || !body.password) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const created = await prisma.pengguna.create({
    data: {
      nama: body.nama.trim(),
      role: toPenggunaRole(body.role ?? "Kontributor"),
      email: body.email.trim().toLowerCase(),
      passwordHash: hashPassword(body.password),
      status: toActiveStatus(body.status ?? "Aktif"),
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      nama: created.nama,
      role: fromPenggunaRole(created.role),
      email: created.email,
      status: fromActiveStatus(created.status),
    },
    { status: 201 },
  );
}
