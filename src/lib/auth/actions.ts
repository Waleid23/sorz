"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  authErrorMessage,
  validateCredentials,
  type AuthFormState,
} from "./messages";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function logIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  // Login only checks the email shape; Supabase decides if the password is right.
  if (!email || !password)
    return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error), email };

  redirect("/");
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid, email };

  // The confirmation email links back to this site, whichever URL it's on
  // (localhost or Vercel). The URL must be in Supabase's Redirect URLs list.
  const origin = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { error: authErrorMessage(error), email };

  // With "Confirm email" on, there's no session until the link is clicked.
  if (!data.session) {
    return {
      message: `Check ${email} for a confirmation link, then come back and log in.`,
      email,
    };
  }
  redirect("/");
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
