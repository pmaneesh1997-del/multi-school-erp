'use server';

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/sign-in?error=invalid");

  const [user] = await getDb().select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).limit(1);
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    redirect("/sign-in?error=invalid");
  }

  await createSession(user.id);
  redirect("/");
}

export async function signOut() {
  await deleteSession();
  redirect("/sign-in");
}
