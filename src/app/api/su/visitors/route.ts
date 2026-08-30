import { NextRequest, NextResponse } from "next/server";
import { getSuSession } from "@/lib/su-auth";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const session = await getSuSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all";
    const inspectSessionId = searchParams.get("sessionId");

    const client = await getClientPromise();
    const db = client.db("portfolio");
    const sessionCollection = db.collection("visitor_sessions");
    const eventCollection = db.collection("visitor_events");

    // If requesting specific session event trail
    if (inspectSessionId) {
      const sessionDoc = await sessionCollection.findOne({ sessionId: inspectSessionId });
      const events = await eventCollection
        .find({ sessionId: inspectSessionId })
        .sort({ timestamp: 1 })
        .toArray();

      return NextResponse.json({
        session: sessionDoc,
        events,
      });
    }

    // Compute Date Range Filter
    const now = new Date();
    let startDate: Date | null = null;
    if (range === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const queryFilter: Record<string, any> = {};
    if (startDate) {
      queryFilter.startedAt = { $gte: startDate };
    }

    // Apply Filter type
    if (filter === "human") {
      queryFilter["userAgent.isBot"] = { $ne: true };
    } else if (filter === "bot") {
      queryFilter["userAgent.isBot"] = true;
    } else if (filter === "resume_downloaded") {
      queryFilter.downloadedResume = true;
    } else if (filter === "has_query_params") {
      queryFilter.entryQueryString = { $exists: true, $ne: "" };
    } else if (filter === "mobile") {
      queryFilter["userAgent.device"] = { $regex: /mobile|phone|tablet/i };
    } else if (filter === "desktop") {
      queryFilter["userAgent.device"] = { $regex: /desktop/i };
    } else if (filter === "projects_clicked") {
      queryFilter["projectsClicked.0"] = { $exists: true };
    }

    // Apply Text Search
    if (search) {
      const regex = new RegExp(search, "i");
      queryFilter.$or = [
        { ip: regex },
        { "location.city": regex },
        { "location.country": regex },
        { entryPage: regex },
        { entryQueryString: regex },
        { pagesVisited: regex },
        { "projectsClicked.name": regex },
        { roleSelected: regex },
        { sessionId: regex },
      ];
    }

    // Fetch matching sessions for pagination
    const totalMatching = await sessionCollection.countDocuments(queryFilter);
    const skip = (page - 1) * limit;

    const sessions = await sessionCollection
      .find(queryFilter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Aggregations across all sessions in time range
    const baseRangeFilter: Record<string, any> = startDate ? { startedAt: { $gte: startDate } } : {};
    const allRangeSessions = await sessionCollection
      .find(baseRangeFilter)
      .sort({ startedAt: -1 })
      .toArray();

    const uniqueVisitorIds = new Set<string>();
    let totalDurationSum = 0;
    let totalScrollSum = 0;
    let singlePageSessionCount = 0;
    let humanCount = 0;
    let botCount = 0;
    let downloadedResumeCount = 0;

    const projectCounts: Record<string, { name: string; count: number }> = {};
    const pageCounts: Record<string, number> = {};
    const sectionCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = { recruiter: 0, founder: 0, curious: 0, none: 0 };
    const utmSourceCounts: Record<string, number> = {};
    const dailyMap: Record<string, { count: number; dateStr: string; timestamp: number }> = {};

    allRangeSessions.forEach((s) => {
      if (s.visitorId) uniqueVisitorIds.add(s.visitorId);

      const duration = Number(s.totalDurationSeconds || 0);
      totalDurationSum += duration;

      const scroll = Number(s.maxScrollDepth || 0);
      totalScrollSum += scroll;

      const isBot = !!s.userAgent?.isBot;
      if (isBot) botCount++;
      else humanCount++;

      if (s.downloadedResume) {
        downloadedResumeCount++;
      }

      // Track UTM / campaign source
      const utm = s.queryParams?.utm_source || s.queryParams?.ref || s.queryParams?.source;
      if (utm) {
        const utmKey = String(utm).toLowerCase();
        utmSourceCounts[utmKey] = (utmSourceCounts[utmKey] || 0) + 1;
      }

      const pages = Array.isArray(s.pagesVisited) ? s.pagesVisited : [s.entryPage || "/"];
      if (pages.length <= 1 && duration < 10) {
        singlePageSessionCount++;
      }

      pages.forEach((p: string) => {
        if (!pageCounts[p]) pageCounts[p] = 0;
        pageCounts[p]++;
      });

      if (Array.isArray(s.projectsClicked)) {
        s.projectsClicked.forEach((proj: { name: string }) => {
          if (proj?.name) {
            if (!projectCounts[proj.name]) {
              projectCounts[proj.name] = { name: proj.name, count: 0 };
            }
            projectCounts[proj.name].count++;
          }
        });
      }

      if (Array.isArray(s.sectionsViewed)) {
        s.sectionsViewed.forEach((sec: string) => {
          if (!sectionCounts[sec]) sectionCounts[sec] = 0;
          sectionCounts[sec]++;
        });
      }

      if (s.roleSelected) {
        const role = String(s.roleSelected).toLowerCase();
        if (roleCounts[role] !== undefined) roleCounts[role]++;
        else roleCounts[role] = 1;
      } else {
        roleCounts.none++;
      }

      // Group timeline by day
      const sDate = s.startedAt ? new Date(s.startedAt) : null;
      if (sDate && !isNaN(sDate.getTime())) {
        const dayKey = sDate.toISOString().split("T")[0];
        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = {
            count: 0,
            dateStr: dayKey,
            timestamp: new Date(dayKey).getTime(),
          };
        }
        dailyMap[dayKey].count++;
      }
    });

    const totalSessions = allRangeSessions.length;
    const avgDurationSeconds = totalSessions > 0 ? Math.round(totalDurationSum / totalSessions) : 0;
    const avgScrollDepth = totalSessions > 0 ? Math.round(totalScrollSum / totalSessions) : 0;
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessionCount / totalSessions) * 100) : 0;

    // Total raw page views in range
    const eventRangeFilter: Record<string, any> = { eventType: "page_view" };
    if (startDate) eventRangeFilter.timestamp = { $gte: startDate };
    const totalPageViews = await eventCollection.countDocuments(eventRangeFilter);

    // Format top projects
    const topProjects = Object.values(projectCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Format page distribution
    const pageBreakdown = Object.entries(pageCounts)
      .map(([path, count]) => ({
        path,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Format section distribution
    const sectionBreakdown = Object.entries(sectionCounts)
      .map(([section, count]) => ({
        section,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Format campaigns / sources
    const campaignBreakdown = Object.entries(utmSourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const timeline = Object.values(dailyMap).sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({
      metrics: {
        totalSessions,
        totalPageViews: totalPageViews || totalSessions,
        uniqueVisitors: uniqueVisitorIds.size,
        avgDurationSeconds,
        avgScrollDepth,
        bounceRate,
        humanCount,
        botCount,
        humanRatio: totalSessions > 0 ? Math.round((humanCount / totalSessions) * 100) : 0,
        totalProjectClicks: Object.values(projectCounts).reduce((acc, p) => acc + p.count, 0),
        downloadedResumeCount,
        resumeConversionRate: totalSessions > 0 ? Math.round((downloadedResumeCount / totalSessions) * 100) : 0,
      },
      topProjects,
      pageBreakdown,
      sectionBreakdown,
      campaignBreakdown,
      roleDistribution: roleCounts,
      timeline,
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        startedAt: s.startedAt,
        lastActiveAt: s.lastActiveAt,
        entryPage: s.entryPage || "/",
        entryQueryString: s.entryQueryString || "",
        queryParams: s.queryParams || {},
        referrer: s.referrer || "direct",
        totalDurationSeconds: s.totalDurationSeconds || 0,
        maxScrollDepth: s.maxScrollDepth || 0,
        downloadedResume: Boolean(s.downloadedResume),
        resumeDownloadedAt: s.resumeDownloadedAt || null,
        pagesVisited: s.pagesVisited || [],
        projectsClicked: s.projectsClicked || [],
        sectionsViewed: s.sectionsViewed || [],
        roleSelected: s.roleSelected || null,
        eventCount: s.eventCount || 1,
        ip: s.ip || "unknown",
        location: s.location || { country: "UNKNOWN", region: "", city: "" },
        userAgent: s.userAgent || { raw: "", device: "desktop", isBot: false },
      })),
    });
  } catch (error) {
    console.error("Failed to fetch SU visitors data:", error);
    return NextResponse.json({ error: "Failed to fetch visitors analytics" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSuSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const sessionId = searchParams.get("sessionId");

    if (!id && !sessionId) {
      return NextResponse.json({ error: "Missing id or sessionId parameter" }, { status: 400 });
    }

    const client = await getClientPromise();
    const db = client.db("portfolio");

    let sId = sessionId;
    if (id && ObjectId.isValid(id)) {
      const doc = await db.collection("visitor_sessions").findOne({ _id: new ObjectId(id) });
      if (doc?.sessionId) sId = doc.sessionId;
      await db.collection("visitor_sessions").deleteOne({ _id: new ObjectId(id) });
    } else if (sessionId) {
      await db.collection("visitor_sessions").deleteOne({ sessionId });
    }

    if (sId) {
      await db.collection("visitor_events").deleteMany({ sessionId: sId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete visitor session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
