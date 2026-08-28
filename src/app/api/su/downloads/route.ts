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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all";
    const country = searchParams.get("country")?.trim() || "";

    const client = await getClientPromise();
    const db = client.db("portfolio");
    const collection = db.collection("resume_downloads");

    const query: Record<string, unknown> = {};

    // Filter by type
    if (filter === "human") {
      query["userAgent.isBot"] = { $ne: true };
    } else if (filter === "bot") {
      query["userAgent.isBot"] = true;
    } else if (filter === "mobile") {
      query["userAgent.device.type"] = { $in: ["mobile", "tablet", "Mobile", "Tablet"] };
      query["userAgent.isBot"] = { $ne: true };
    } else if (filter === "desktop") {
      query["userAgent.device.type"] = { $in: ["desktop", "Desktop", "unknown", undefined] };
      query["userAgent.isBot"] = { $ne: true };
    }

    // Filter by country
    if (country && country !== "ALL") {
      query["location.country"] = { $regex: new RegExp(`^${country}$`, "i") };
    }

    // Search query
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { ip: searchRegex },
        { "location.country": searchRegex },
        { "location.city": searchRegex },
        { "location.region": searchRegex },
        { "userAgent.browser.name": searchRegex },
        { "userAgent.os.name": searchRegex },
        { "userAgent.device.type": searchRegex },
        { referer: searchRegex },
      ];
    }

    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const rawDocs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const downloads = rawDocs.map((doc) => {
      let city = doc.location?.city || "unknown";
      let region = doc.location?.region || "unknown";
      if (city !== "unknown") {
        try {
          city = decodeURIComponent(city.replace(/\+/g, " "));
        } catch {
          // keep original
        }
      }
      if (region !== "unknown") {
        try {
          region = decodeURIComponent(region.replace(/\+/g, " "));
        } catch {
          // keep original
        }
      }

      return {
        id: doc._id.toString(),
        timestamp: doc.timestamp,
        ip: doc.ip || "unknown",
        location: {
          country: doc.location?.country || "unknown",
          region,
          city,
          latitude: doc.location?.latitude || "unknown",
          longitude: doc.location?.longitude || "unknown",
        },
        userAgent: {
          raw: doc.userAgent?.raw || "",
          device: doc.userAgent?.device || { type: "desktop" },
          browser: doc.userAgent?.browser || { name: "unknown" },
          os: doc.userAgent?.os || { name: "unknown" },
          cpu: doc.userAgent?.cpu || {},
          isBot: !!doc.userAgent?.isBot,
        },
        referer: doc.referer || "direct",
        acceptLanguage: doc.acceptLanguage || "unknown",
      };
    });

    return NextResponse.json({
      downloads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch SU downloads list:", error);
    return NextResponse.json(
      { error: "Failed to fetch download logs" },
      { status: 500 }
    );
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

    if (!id) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const client = await getClientPromise();
    const db = client.db("portfolio");
    const collection = db.collection("resume_downloads");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Record deleted" });
  } catch (error) {
    console.error("Failed to delete record:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
