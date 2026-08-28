import { NextRequest, NextResponse } from "next/server";
import { getSuSession } from "@/lib/su-auth";
import { getClientPromise } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const session = await getSuSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all"; // '24h' | '7d' | '30d' | 'all'

    const client = await getClientPromise();
    const db = client.db("portfolio");
    const collection = db.collection("resume_downloads");

    // Compute date filter
    const now = new Date();
    let startDate: Date | null = null;
    if (range === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchFilter: Record<string, unknown> = {};
    if (startDate) {
      matchFilter.timestamp = { $gte: startDate };
    }

    // Fetch all matching records (or up to 10000 for aggregation)
    const docs = await collection
      .find(matchFilter)
      .sort({ timestamp: -1 })
      .toArray();

    const totalDownloads = docs.length;

    // Time ranges comparison (always compute global 24h, 7d, 30d stats)
    const d24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let countLast24h = 0;
    let countLast7d = 0;
    let countLast30d = 0;

    const uniqueIps = new Set<string>();
    const countryCounts: Record<string, { count: number; name: string }> = {};
    const cityCounts: Record<string, { count: number; country: string; region: string }> = {};
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, bot: 0, other: 0 };
    let botCount = 0;
    let humanCount = 0;
    const referrerCounts: Record<string, number> = {};

    // Grouping by date for timeline chart (e.g. YYYY-MM-DD)
    const dailyMap: Record<string, { count: number; dateStr: string; timestamp: number }> = {};

    docs.forEach((doc) => {
      const docDate = doc.timestamp ? new Date(doc.timestamp) : null;
      if (docDate && !isNaN(docDate.getTime())) {
        if (docDate >= d24h) countLast24h++;
        if (docDate >= d7d) countLast7d++;
        if (docDate >= d30d) countLast30d++;

        const dayKey = docDate.toISOString().split("T")[0];
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = {
            count: 0,
            dateStr: dayKey,
            timestamp: new Date(dayKey).getTime(),
          };
        }
        dailyMap[dayKey].count++;
      }

      // Unique IP
      if (doc.ip && doc.ip !== "unknown") {
        uniqueIps.add(doc.ip);
      }

      // Location
      const country = (doc.location?.country || "unknown").toUpperCase();
      let city = doc.location?.city || "unknown";
      let region = doc.location?.region || "";

      if (city !== "unknown") {
        try {
          city = decodeURIComponent(city.replace(/\+/g, " "));
        } catch {
          // keep original
        }
      }
      if (region && region !== "unknown") {
        try {
          region = decodeURIComponent(region.replace(/\+/g, " "));
        } catch {
          // keep original
        }
      }

      if (!countryCounts[country]) {
        countryCounts[country] = { count: 0, name: country };
      }
      countryCounts[country].count++;

      if (city !== "unknown" && city) {
        const cityKey = `${city}, ${country}`;
        if (!cityCounts[cityKey]) {
          cityCounts[cityKey] = { count: 0, country, region };
        }
        cityCounts[cityKey].count++;
      }

      // User Agent & Device
      const isBot = !!doc.userAgent?.isBot;
      if (isBot) {
        botCount++;
        deviceCounts.bot++;
      } else {
        humanCount++;
        const rawType = (doc.userAgent?.device?.type || "desktop").toLowerCase();
        if (rawType.includes("mobile") || rawType.includes("phone")) {
          deviceCounts.mobile++;
        } else if (rawType.includes("tablet") || rawType.includes("ipad")) {
          deviceCounts.tablet++;
        } else if (rawType.includes("desktop") || rawType === "unknown") {
          deviceCounts.desktop++;
        } else {
          deviceCounts.other++;
        }
      }

      // OS
      let osName = doc.userAgent?.os?.name || "Unknown";
      if (osName === "Mac OS" || osName === "macOS") osName = "macOS";
      if (!osCounts[osName]) osCounts[osName] = 0;
      osCounts[osName]++;

      // Browser
      let browserName = doc.userAgent?.browser?.name || "Unknown";
      if (browserName.includes("Chrome")) browserName = "Chrome";
      else if (browserName.includes("Safari")) browserName = "Safari";
      else if (browserName.includes("Firefox")) browserName = "Firefox";
      else if (browserName.includes("Edge")) browserName = "Edge";
      else if (browserName.includes("Opera")) browserName = "Opera";
      if (!browserCounts[browserName]) browserCounts[browserName] = 0;
      browserCounts[browserName]++;

      // Referrer
      let ref = doc.referer || "direct";
      if (ref === "unknown" || !ref || ref === "") ref = "direct";
      try {
        if (ref !== "direct") {
          const url = new URL(ref);
          ref = url.pathname === "/" ? url.hostname : `${url.hostname}${url.pathname}`;
        }
      } catch {
        // keep as is
      }
      if (!referrerCounts[ref]) referrerCounts[ref] = 0;
      referrerCounts[ref]++;
    });

    // Sort timeline chronologically
    const timeline = Object.values(dailyMap).sort((a, b) => a.timestamp - b.timestamp);

    // Format top countries
    const countries = Object.entries(countryCounts)
      .map(([code, item]) => ({
        code,
        name: item.name,
        count: item.count,
        percentage: totalDownloads > 0 ? Math.round((item.count / totalDownloads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Format top cities
    const cities = Object.entries(cityCounts)
      .map(([name, item]) => ({
        name,
        count: item.count,
        country: item.country,
        region: item.region,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Format OS
    const os = Object.entries(osCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalDownloads > 0 ? Math.round((count / totalDownloads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Format Browsers
    const browsers = Object.entries(browserCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalDownloads > 0 ? Math.round((count / totalDownloads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Format Devices
    const devices = [
      { name: "Desktop", count: deviceCounts.desktop, key: "desktop" },
      { name: "Mobile", count: deviceCounts.mobile, key: "mobile" },
      { name: "Tablet", count: deviceCounts.tablet, key: "tablet" },
      { name: "Bots / Crawlers", count: deviceCounts.bot, key: "bot" },
    ].map((d) => ({
      ...d,
      percentage: totalDownloads > 0 ? Math.round((d.count / totalDownloads) * 100) : 0,
    }));

    // Format Referrers
    const referrers = Object.entries(referrerCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalDownloads > 0 ? Math.round((count / totalDownloads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      metrics: {
        totalDownloads,
        countLast24h,
        countLast7d,
        countLast30d,
        uniqueIpsCount: uniqueIps.size,
        humanCount,
        botCount,
        humanRatio: totalDownloads > 0 ? Math.round((humanCount / totalDownloads) * 100) : 0,
      },
      timeline,
      countries,
      cities,
      os,
      browsers,
      devices,
      referrers,
    });
  } catch (error) {
    console.error("Failed to generate SU analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics data" },
      { status: 500 }
    );
  }
}
