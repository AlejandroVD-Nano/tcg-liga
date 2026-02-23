"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/Client";

type Mode = "login" | "signup";

export default function LoginPage() {
    const router = useRouter();

    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.replace("/");
            }
        })();
    }, [router]);

    function normalizeEmail(v: string) {
        return v.trim().toLowerCase();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus(null);
        setLoading(true);

        const cleanEmail = normalizeEmail(email);

        try {
            if (mode === "signup") {
                if (!displayName.trim()) {
                    setStatus("Debes escribir tu nombre.");
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            display_name: displayName.trim(),
                        },
                    },
                });

                if (error) throw error;

                setStatus(
                    "Registro listo. Revisa tu correo para confirmar tu cuenta."
                );
                return;
            }

            // LOGIN
            const { error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });

            if (error) throw error;

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setStatus(err?.message ?? "Ocurrió un error.");
        } finally {
            setLoading(false);
        }
    }

    async function resetPassword() {
        if (!email) {
            setStatus("Primero escribe tu email.");
            return;
        }

        setLoading(true);
        setStatus(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login`,
        });

        if (error) setStatus(error.message);
        else setStatus("Te envié un correo para resetear tu contraseña.");

        setLoading(false);
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6" style={StyleSheet.fondo}>
            <div className="w-full max-w-md rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-zinc-950/40">
                <h1 className="text-2xl font-semibold">TCG Liga</h1>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {mode === "signup" && (
                        <div className="space-y-1">
                            <label className="text-sm">Nombre</label>
                            <input
                                className="w-full rounded-xl border px-3 py-2 text-sm"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Usuario"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm">Email</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm">Contraseña</label>
                        <input
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        className="w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-zinc-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Cargando..."
                            : mode === "login"
                                ? "Entrar"
                                : "Registrarme"}
                    </button>
                </form>

                {status && (
                    <div className="mt-4 rounded-xl border p-3 text-sm">
                        {status}
                    </div>
                )}

                <div className="mt-4 flex justify-between text-sm">
                    <button
                        className="underline"
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        type="button"
                    >
                        {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
                    </button>

                    <button
                        className="underline"
                        onClick={resetPassword}
                        type="button"
                    >
                        Olvidé contraseña
                    </button>
                </div>
            </div>
        </main>
    );
}

const StyleSheet = {
    fondo: {
        backgroundColor: "#241571",
    }
};