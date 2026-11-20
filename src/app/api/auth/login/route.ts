import { proxyAuthRequest } from "@/lib/server/auth-proxy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyAuthRequest(request, "login");
}
