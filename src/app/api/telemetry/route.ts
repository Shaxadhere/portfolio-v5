import { NextRequest, NextResponse, userAgent } from "next/server";
import { getClientPromise } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ ok: true });
    }

    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: true });
    }

    const {
      eventType,
      path = "/",
      referrer = "",
      metadata = {},
      visitorId = "anon",
      sessionId = "anon_session",
      timestamp = Date.now(),
    } = payload;

    // Ignore admin dashboard routes
    if (path.startsWith("/su") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const headersList = request.headers;

    // Extract IP address
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Extract Vercel Geolocation headers
    let country = headersList.get("x-vercel-ip-country") || "unknown";
    let region = headersList.get("x-vercel-ip-country-region") || "unknown";
    let city = headersList.get("x-vercel-ip-city") || "unknown";
    let latitude = headersList.get("x-vercel-ip-latitude") || "unknown";
    let longitude = headersList.get("x-vercel-ip-longitude") || "unknown";

    // Fallback IP lookup if geolocation headers are absent and IP is public
    if (
      country === "unknown" &&
      ip !== "unknown" &&
      !ip.startsWith("127.") &&
      ip !== "::1" &&
      !ip.startsWith("192.168.") &&
      !ip.startsWith("10.")
    ) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: controller.signal,
          headers: { "User-Agent": "portfolio-analytics/1.0" },
        });
        clearTimeout(timeoutId);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.country_code) country = geoData.country_code;
          if (geoData.region_code) region = geoData.region_code;
          if (geoData.city) city = geoData.city;
          if (geoData.latitude) latitude = String(geoData.latitude);
          if (geoData.longitude) longitude = String(geoData.longitude);
        }
      } catch {
        // Continue silently
      }
    }

    // Parse User-Agent
    const ua = userAgent(request);

    const client = await getClientPromise();
    const db = client.db("portfolio");

    const eventDate = new Date(timestamp);

    // 1. Record raw event in 'visitor_events'
    const eventDoc = {
      sessionId,
      visitorId,
      eventType,
      path,
      metadata,
      timestamp: eventDate,
      ip,
      location: {
        country: country.toUpperCase(),
        region,
        city,
        latitude,
        longitude,
      },
      userAgent: {
        raw: headersList.get("user-agent") || "unknown",
        device: {
          model: ua.device?.model || "unknown",
          type: ua.device?.type || "desktop",
          vendor: ua.device?.vendor || "unknown",
        },
        browser: {
          name: ua.browser?.name || "unknown",
          version: ua.browser?.version || "unknown",
        },
        os: {
          name: ua.os?.name || "unknown",
          version: ua.os?.version || "unknown",
        },
        isBot: ua.isBot || false,
      },
      referrer: referrer || headersList.get("referer") || "direct",
    };

    await db.collection("visitor_events").insertOne(eventDoc);

    // 2. Upsert / update 'visitor_sessions' aggregate
    const sessionCollection = db.collection("visitor_sessions");

    const existingSession = await sessionCollection.findOne({ sessionId });

    const durationSeconds = Number(metadata?.activeDurationSeconds || 0);
    const scrollDepth = Number(metadata?.scrollPercent || metadata?.maxScrollDepth || 0);

    const updateFields: Record<string, any> = {
      lastActiveAt: eventDate,
      ip,
      "location.country": country.toUpperCase(),
      "location.region": region,
      "location.city": city,
      "location.latitude": latitude,
      "location.longitude": longitude,
      "userAgent.raw": headersList.get("user-agent") || "unknown",
      "userAgent.device": ua.device?.type || "desktop",
      "userAgent.browser": ua.browser?.name || "unknown",
      "userAgent.os": ua.os?.name || "unknown",
      "userAgent.isBot": ua.isBot || false,
    };

    if (durationSeconds > 0) {
      updateFields.totalDurationSeconds = Math.max(
        existingSession?.totalDurationSeconds || 0,
        durationSeconds
      );
    }

    if (scrollDepth > 0) {
      updateFields.maxScrollDepth = Math.max(
        existingSession?.maxScrollDepth || 0,
        scrollDepth
      );
    }

    if (eventType === "role_select" && metadata?.role) {
      updateFields.roleSelected = String(metadata.role);
    }

    const pushUpdates: Record<string, any> = {};

    if (path) {
      pushUpdates.pagesVisited = path;
    }

    if (eventType === "project_click" && metadata?.projectName) {
      pushUpdates.projectsClicked = {
        name: String(metadata.projectName),
        url: String(metadata.url || ""),
        timestamp: eventDate,
      };
    }

    if (eventType === "section_view" && metadata?.sectionId) {
      pushUpdates.sectionsViewed = String(metadata.sectionId);
    }

    if (!existingSession) {
      // Create new session
      await sessionCollection.insertOne({
        sessionId,
        visitorId,
        startedAt: eventDate,
        lastActiveAt: eventDate,
        entryPage: path,
        referrer: referrer || headersList.get("referer") || "direct",
        totalDurationSeconds: durationSeconds || 0,
        maxScrollDepth: scrollDepth || 0,
        pagesVisited: [path],
        projectsClicked:
          eventType === "project_click" && metadata?.projectName
            ? [
                {
                  name: String(metadata.projectName),
                  url: String(metadata.url || ""),
                  timestamp: eventDate,
                },
              ]
            : [],
        sectionsViewed:
          eventType === "section_view" && metadata?.sectionId
            ? [String(metadata.sectionId)]
            : [],
        roleSelected: eventType === "role_select" && metadata?.role ? String(metadata.role) : null,
        eventCount: 1,
        ip,
        location: {
          country: country.toUpperCase(),
          region,
          city,
          latitude,
          longitude,
        },
        userAgent: {
          raw: headersList.get("user-agent") || "unknown",
          device: ua.device?.type || "desktop",
          browser: ua.browser?.name || "unknown",
          os: ua.os?.name || "unknown",
          isBot: ua.isBot || false,
        },
      });
    } else {
      // Update session document
      const mongoUpdate: Record<string, any> = {
        $set: updateFields,
        $inc: { eventCount: 1 },
      };

      const addToSet: Record<string, any> = {};
      if (path) addToSet.pagesVisited = path;
      if (eventType === "section_view" && metadata?.sectionId) {
        addToSet.sectionsViewed = String(metadata.sectionId);
      }

      if (Object.keys(addToSet).length > 0) {
        mongoUpdate.$addToSet = addToSet;
      }

      if (pushUpdates.projectsClicked) {
        mongoUpdate.$push = { projectsClicked: pushUpdates.projectsClicked };
      }

      await sessionCollection.updateOne({ sessionId }, mongoUpdate);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Telemetry ingestion error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
