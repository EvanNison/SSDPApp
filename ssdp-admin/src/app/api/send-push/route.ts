import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

interface ExpoPushMessage {
  to: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  sound?: string;
}

export async function POST(request: Request) {
  try {
    const { title, body, type, targetRole, actionUrl } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get target users with push tokens
    let query = supabaseAdmin
      .from("profiles")
      .select("id, push_token")
      .not("push_token", "is", null);

    if (targetRole && targetRole !== "all") {
      query = query.eq("role", targetRole);
    }

    const { data: users, error: usersError } = await query;
    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return NextResponse.json({ pushed: 0, reason: "No users with push tokens" });
    }

    // Insert in-app notifications for all targeted users (with or without push tokens)
    let allUsersQuery = supabaseAdmin.from("profiles").select("id");
    if (targetRole && targetRole !== "all") {
      allUsersQuery = allUsersQuery.eq("role", targetRole);
    }
    const { data: allUsers } = await allUsersQuery;

    if (allUsers && allUsers.length > 0) {
      const notificationRows = allUsers.map((u) => ({
        user_id: u.id,
        title,
        body: body || null,
        type: type || "system",
        action_url: actionUrl || null,
      }));
      await supabaseAdmin.from("notifications").insert(notificationRows);
    }

    // Build Expo push messages
    const pushTokens = users
      .map((u) => u.push_token)
      .filter((t): t is string => !!t && t.startsWith("ExponentPushToken["));

    if (pushTokens.length === 0) {
      return NextResponse.json({
        pushed: 0,
        inApp: allUsers?.length ?? 0,
        reason: "No valid Expo push tokens",
      });
    }

    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      title,
      body: body || undefined,
      data: actionUrl ? { action_url: actionUrl } : undefined,
      sound: "default",
    }));

    // Send via Expo Push API (in chunks of 100)
    let pushed = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (response.ok) {
        pushed += chunk.length;
      }
    }

    return NextResponse.json({
      pushed,
      inApp: allUsers?.length ?? 0,
      total: users.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send push notifications" },
      { status: 500 }
    );
  }
}
