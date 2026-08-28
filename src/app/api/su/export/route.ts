import { NextResponse } from "next/server";
import { getSuSession } from "@/lib/su-auth";
import { getClientPromise } from "@/lib/mongodb";

export async function GET() {
  const session = await getSuSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("portfolio");
    const collection = db.collection("resume_downloads");

    const docs = await collection.find({}).sort({ timestamp: -1 }).toArray();

    // Generate CSV
    const headers = [
      "Timestamp (UTC)",
      "IP Address",
      "Country",
      "Region",
      "City",
      "Latitude",
      "Longitude",
      "Device Type",
      "Operating System",
      "OS Version",
      "Browser",
      "Browser Version",
      "Is Bot",
      "Referrer",
      "Accept Language",
      "Raw User Agent",
    ];

    const escapeCsv = (str: unknown) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = docs.map((doc) => [
      escapeCsv(doc.timestamp ? new Date(doc.timestamp).toISOString() : ""),
      escapeCsv(doc.ip || ""),
      escapeCsv(doc.location?.country || ""),
      escapeCsv(doc.location?.region || ""),
      escapeCsv(doc.location?.city || ""),
      escapeCsv(doc.location?.latitude || ""),
      escapeCsv(doc.location?.longitude || ""),
      escapeCsv(doc.userAgent?.device?.type || "desktop"),
      escapeCsv(doc.userAgent?.os?.name || ""),
      escapeCsv(doc.userAgent?.os?.version || ""),
      escapeCsv(doc.userAgent?.browser?.name || ""),
      escapeCsv(doc.userAgent?.browser?.version || ""),
      escapeCsv(doc.userAgent?.isBot ? "Yes" : "No"),
      escapeCsv(doc.referer || ""),
      escapeCsv(doc.acceptLanguage || ""),
      escapeCsv(doc.userAgent?.raw || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="resume_downloads_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export downloads CSV:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
