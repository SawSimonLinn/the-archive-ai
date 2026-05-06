import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getRequestOrigin, getSafeRedirectPath } from "@/lib/site-url";

function getAuthErrorCode(errorDescription: string | null) {
  const normalizedDescription = errorDescription?.toLowerCase() ?? "";

  if (
    normalizedDescription.includes("multiple accounts") &&
    normalizedDescription.includes("same email")
  ) {
    return "account_linking_conflict";
  }

  return "auth_error";
}

function redirectToAuthError(origin: string, errorDescription: string | null) {
  const redirectUrl = new URL("/auth", origin);
  redirectUrl.searchParams.set("error", getAuthErrorCode(errorDescription));

  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return redirectToAuthError(origin, searchParams.get("error_description"));
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    return redirectToAuthError(origin, error.message);
  }

  return redirectToAuthError(origin, null);
}
