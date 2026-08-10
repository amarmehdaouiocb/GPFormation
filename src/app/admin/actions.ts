"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export type AdminLoginState = {
  message: string;
} | null;

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password || username.length > 255 || password.length > 255) {
    return { message: "Renseignez votre identifiant et votre mot de passe." };
  }

  let authenticated = false;

  try {
    authenticated = verifyAdminCredentials(username, password);

    if (authenticated) {
      await createAdminSession(username);
    }
  } catch (error) {
    console.error("Admin authentication is not configured", error);
    return {
      message:
        "L’espace administrateur n’est pas encore configuré. Contactez le gestionnaire du site.",
    };
  }

  if (!authenticated) {
    return { message: "Identifiant ou mot de passe incorrect." };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/connexion");
}
