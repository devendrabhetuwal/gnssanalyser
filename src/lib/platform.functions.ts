import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Signed-in researcher's own workspace numbers. */
export const getWorkspaceSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [projects, files, metrics] = await Promise.all([
      supabase.from("projects").select("id, name, status, storage_bytes, updated_at").order("updated_at", { ascending: false }),
      supabase.from("project_files").select("id, filename, format, size_bytes, transfer_status, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("render_metrics").select("id, kind, label, duration_ms, point_count, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const projectRows = projects.data ?? [];
    const metricRows = metrics.data ?? [];

    return {
      userId,
      projectCount: projectRows.length,
      storageBytes: projectRows.reduce((a, p) => a + Number(p.storage_bytes ?? 0), 0),
      activeTransfers: (files.data ?? []).filter((f) => f.transfer_status !== "complete").length,
      avgRenderMs: metricRows.length
        ? Math.round(metricRows.reduce((a, m) => a + m.duration_ms, 0) / metricRows.length)
        : 0,
      projects: projectRows,
      files: files.data ?? [],
      metrics: metricRows,
    };
  });

/** Log a plot/processing run so admin telemetry reflects real usage. */
export const logRenderMetric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { kind: string; label: string; durationMs: number; pointCount: number }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("render_metrics").insert({
      user_id: context.userId,
      kind: data.kind,
      label: data.label,
      duration_ms: Math.max(0, Math.round(data.durationMs)),
      point_count: Math.max(0, Math.round(data.pointCount)),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Platform-wide telemetry. Admin only. */
export const getAdminTelemetry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: administrator role required");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [profiles, roles, projects, files, metrics] = await Promise.all([
      supabase.from("profiles").select("id, email, display_name, auth_provider, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("projects").select("id, name, owner_id, status, storage_bytes, updated_at").order("updated_at", { ascending: false }),
      supabase.from("project_files").select("id, filename, format, size_bytes, transfer_status, owner_id, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("render_metrics").select("id, kind, label, duration_ms, point_count, succeeded, created_at").gte("created_at", since).order("created_at", { ascending: false }),
    ]);

    const profileRows = profiles.data ?? [];
    const roleRows = roles.data ?? [];
    const projectRows = projects.data ?? [];
    const fileRows = files.data ?? [];
    const metricRows = metrics.data ?? [];

    const projectsByOwner = new Map<string, number>();
    for (const p of projectRows) projectsByOwner.set(p.owner_id, (projectsByOwner.get(p.owner_id) ?? 0) + 1);

    const storageByOwner = new Map<string, number>();
    for (const p of projectRows) {
      storageByOwner.set(p.owner_id, (storageByOwner.get(p.owner_id) ?? 0) + Number(p.storage_bytes ?? 0));
    }

    const users = profileRows.map((p) => ({
      id: p.id,
      email: p.email,
      name: p.display_name,
      provider: p.auth_provider,
      role: roleRows.some((r) => r.user_id === p.id && r.role === "admin") ? "ADMIN" : "USER",
      projects: projectsByOwner.get(p.id) ?? 0,
      storageBytes: storageByOwner.get(p.id) ?? 0,
    }));

    const totalStorage =
      projectRows.reduce((a, p) => a + Number(p.storage_bytes ?? 0), 0) +
      fileRows.reduce((a, f) => a + Number(f.size_bytes ?? 0), 0);

    return {
      users,
      projects: projectRows,
      files: fileRows,
      totals: {
        userCount: profileRows.length,
        adminCount: roleRows.filter((r) => r.role === "admin").length,
        projectCount: projectRows.length,
        fileCount: fileRows.length,
        storageBytes: totalStorage,
        activeTransfers: fileRows.filter((f) => f.transfer_status !== "complete").length,
        rendersLast24h: metricRows.length,
        pointsLast24h: metricRows.reduce((a, m) => a + m.point_count, 0),
        avgRenderMs: metricRows.length
          ? Math.round(metricRows.reduce((a, m) => a + m.duration_ms, 0) / metricRows.length)
          : 0,
        failureRate: metricRows.length
          ? Math.round((metricRows.filter((m) => !m.succeeded).length / metricRows.length) * 100)
          : 0,
      },
      recentMetrics: metricRows.slice(0, 25),
    };
  });

/** Promote/demote a user. Only the MAIN_ADMIN account may change admin roles. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { targetUserId: string; makeAdmin: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: administrator role required");

    const { data: callerProfile, error: callerError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    if (callerError) throw new Error(callerError.message);

    // Admin 1 and all other admins are deliberately prevented from changing roles.
    // The main administrator is identified by the dedicated MAIN_ADMIN_EMAIL value.
    const mainAdminEmail = process.env.MAIN_ADMIN_EMAIL?.trim().toLowerCase();
    if (!mainAdminEmail || callerProfile?.email?.trim().toLowerCase() !== mainAdminEmail) {
      throw new Error("Forbidden: only the Main Administrator can change admin access");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.targetUserId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      if (data.targetUserId === userId) {
        throw new Error("The Main Administrator cannot remove their own admin access");
      }
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.targetUserId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
