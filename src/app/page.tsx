"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import RankingBoard from "@/components/RankingBoard";

type Profile = {
  tag_id: string;
  display_name: string;
};

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setProfile(null);
        setLoadingUser(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("tag_id, display_name")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }

      setLoadingUser(false);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen p-6" style={StyleSheet.fondo} >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={StyleSheet.h1}><b>Ranking mensual</b></h1>
        </div>

        <div>
          {loadingUser ? (
            <span className="text-sm opacity-60">Cargando...</span>
          ) : profile ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={StyleSheet.letrafondo}>
                TagID: {profile.tag_id}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm underline" style={StyleSheet.boton}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link className="underline text-sm" href="/login" style={StyleSheet.boton}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <section className="mt-6">
        <RankingBoard />
      </section>
    </main>
  );
}

const StyleSheet = {
    fondo: {
        backgroundColor: "#241571",
    },
    h1: {
        color: "#979DFB",
        fontSize: 40,
    },
    letrafondo:{
        color: "#979DFB",
        fontSize: 15,
    },
    boton:{
      color: "#979DFB",
    }
};