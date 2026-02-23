import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
    // En Next route handlers, supabase client del browser no aplica,
    // pero aquí NO necesitamos intercambiar tokens manualmente si usas el flujo estándar.
    // Simplemente redirigimos a login con un mensaje.
    const url = new URL(request.url);

    // Si quieres leer "code" o "token_hash" del callback, se puede más adelante.
    // Por ahora, redirigimos.
    url.pathname = "/login";
    url.searchParams.set("confirmed", "1");

    return NextResponse.redirect(url.toString());
}