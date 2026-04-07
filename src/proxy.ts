export { updateSession as proxy } from "@/lib/supabase/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*", "/training/:path*", "/history/:path*", "/progress/:path*", "/schedule/:path*"],
};