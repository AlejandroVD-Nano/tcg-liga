"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Sunshiney } from "next/font/google";

type League = {
    id: string;
    slug: string;
    name: string;
};

type RankingRow = {
    id: string;
    league_id: string;
    month: string;
    tag_id: string;
    display_name: string;
    points: number;
    matches_played: number;
    wins: number;
};

function firstDayOfCurrentMonthISO(): string {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    return first.toISOString().slice(0, 10);
}

function medal(i: number) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return "";
}

export default function RankingBoard() {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [rows, setRows] = useState<RankingRow[]>([]);
    const [month, setMonth] = useState<string>(firstDayOfCurrentMonthISO());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const { data: leaguesData, error: leaguesError } = await supabase
                    .from("leagues")
                    .select("id,slug,name")
                    .eq("is_active", true)
                    .order("name", { ascending: true });

                if (leaguesError) throw leaguesError;

                const { data: rankingData, error: rankingError } = await supabase
                    .from("monthly_rankings")
                    .select("id,league_id,month,tag_id,display_name,points,matches_played,wins")
                    .eq("month", month)
                    .order("points", { ascending: false })
                    .order("wins", { ascending: false });

                if (rankingError) throw rankingError;

                setLeagues(leaguesData ?? []);
                setRows(rankingData ?? []);
            } catch (err: any) {
                setError(err?.message ?? "Error cargando ranking.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [month]);

    const rowsByLeague = useMemo(() => {
        const map = new Map<string, RankingRow[]>();
        for (const r of rows) {
            const arr = map.get(r.league_id) ?? [];
            arr.push(r);
            map.set(r.league_id, arr);
        }
        return map;
    }, [rows]);

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-zinc-950/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-sm font-medium" style={{ fontSize: 25 }}><b>Mes del ranking</b></div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            className="w-[180px] rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none ring-0 transition focus:border-zinc-400 dark:bg-zinc-900"
                            type="date"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* States */}
            {loading && (
                <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-zinc-950/40">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
                        <div className="text-sm">Cargando ranking...</div>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-zinc-950/40">
                    <div className="text-sm">
                        <b>Error:</b> {error}
                    </div>
                </div>
            )}

            {!loading && !error && leagues.length === 0 && (
                <div className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-zinc-950/40">
                    <div className="text-sm">No hay ligas activas.</div>
                </div>
            )}

            {/* League cards */}
            {!loading && !error && leagues.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                    {leagues.map((league) => {
                        const leagueRows = rowsByLeague.get(league.id) ?? [];

                        return (
                            <div
                                key={league.id}
                                className="rounded-2xl border bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md dark:bg-zinc-950/40"
                                style={StyleSheet.card}>
                                <div className="flex items-start justify-between gap-3" >
                                    <div>
                                        <h2 className="text-base font-semibold">{league.name}</h2>
                                        <p className="text-xs opacity-70">Top del mes: {month}</p>
                                    </div>

                                    <span className="rounded-full border bg-white px-3 py-1 text-xs shadow-sm dark:bg-zinc-900">
                                        Ranking
                                    </span>
                                </div>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-left text-xs opacity-70">
                                            <tr className="border-b">
                                                <th className="py-2 pr-2 w-10">#</th>
                                                <th className="py-2 pr-2">Jugador</th>
                                                <th className="py-2 pr-2 text-right">Pts</th>
                                                <th className="py-2 pr-2 text-right">W</th>
                                                <th className="py-2 text-right">J</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {leagueRows.length === 0 ? (
                                                <tr>
                                                    <td className="py-4 text-xs opacity-70" colSpan={5}>
                                                        Sin resultados aún.
                                                    </td>
                                                </tr>
                                            ) : (
                                                leagueRows.slice(0, 10).map((r, i) => (
                                                    <tr
                                                        key={r.id}
                                                        className="border-t transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40"
                                                    >
                                                        <td className="py-2 pr-2 align-top">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs opacity-70">
                                                                    {i + 1}
                                                                </span>
                                                                <span className="text-xs">{medal(i)}</span>
                                                            </div>
                                                        </td>

                                                        <td className="py-2 pr-2">
                                                            <div className="font-medium leading-tight">
                                                                {r.display_name}
                                                            </div>
                                                            <div className="mt-0.5 text-xs opacity-70">
                                                                {r.tag_id}
                                                            </div>
                                                        </td>

                                                        <td className="py-2 pr-2 text-right align-top">
                                                            <span className="inline-flex min-w-[46px] justify-center rounded-full border bg-white px-2 py-1 text-xs font-semibold shadow-sm dark:bg-zinc-900">
                                                                {r.points}
                                                            </span>
                                                        </td>

                                                        <td className="py-2 pr-2 text-right align-top">
                                                            {r.wins}
                                                        </td>

                                                        <td className="py-2 text-right align-top">
                                                            {r.matches_played}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 text-xs opacity-70">
                                    Mostrando top 10.
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const StyleSheet = {
    card: {
    }
};
