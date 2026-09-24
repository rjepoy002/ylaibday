import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "http://localhost",
  "https://ylaibday.vercel.app",
];

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";

  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "https://ylaibday.vercel.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

function getSecretKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!secretKeys) return null;

  try {
    return JSON.parse(secretKeys).default || null;
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "GET") {
    return json(request, { messages: [], error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = getSecretKey();

  if (!supabaseUrl || !secretKey) {
    console.error("Missing Supabase server configuration.");
    return json(request, { messages: [], error: "Unable to load messages." }, 500);
  }

  const supabase = createClient(supabaseUrl, secretKey);
  const { data, error } = await supabase
    .from("rsvps")
    .select("guest_name,message")
    .not("message", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Public message query failed.", error);
    return json(request, { messages: [], error: "Unable to load messages." }, 500);
  }

  const messages = (data || [])
    .map((item) => ({
      name: typeof item.guest_name === "string" ? item.guest_name.trim() : "",
      message: typeof item.message === "string" ? item.message.trim() : "",
    }))
    .filter((item) => item.name.length > 0 && item.message.length > 0)
    .slice(0, 24);

  return json(request, { messages });
});
