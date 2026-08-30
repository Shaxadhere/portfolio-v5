import { NextRequest, NextResponse, userAgent } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const headersList = request.headers;

    // Extract IP address from common headers
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
               headersList.get('x-real-ip') ||
               'unknown';

    // Extract Vercel Geolocation headers
    let country = headersList.get('x-vercel-ip-country') || 'unknown';
    let region = headersList.get('x-vercel-ip-country-region') || 'unknown';
    let city = headersList.get('x-vercel-ip-city') || 'unknown';
    let latitude = headersList.get('x-vercel-ip-latitude') || 'unknown';
    let longitude = headersList.get('x-vercel-ip-longitude') || 'unknown';

    // Fallback IP lookup if geolocation headers are absent and IP is public
    if (country === 'unknown' && ip !== 'unknown' && !ip.startsWith('127.') && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'portfolio-analytics/1.0' },
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
        // Continue silently if geo lookup fails or times out
      }
    }

    // Parse User-Agent using Next.js helper
    const ua = userAgent(request);

    // Extract query string & parameters
    const { searchParams } = new URL(request.url);
    const queryString = request.url.includes("?") ? `?${request.url.split("?")[1]}` : "";
    const queryParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const sessionId = searchParams.get("sessionId") || searchParams.get("sid") || undefined;
    const visitorId = searchParams.get("visitorId") || searchParams.get("vid") || undefined;

    // Build log document
    const downloadEvent = {
      timestamp: new Date(),
      ip,
      sessionId,
      visitorId,
      queryString,
      queryParams,
      location: {
        country,
        region,
        city,
        latitude,
        longitude
      },
      userAgent: {
        raw: headersList.get('user-agent') || 'unknown',
        device: {
          model: ua.device?.model || 'unknown',
          type: ua.device?.type || 'desktop',
          vendor: ua.device?.vendor || 'unknown',
        },
        browser: {
          name: ua.browser?.name || 'unknown',
          version: ua.browser?.version || 'unknown',
        },
        os: {
          name: ua.os?.name || 'unknown',
          version: ua.os?.version || 'unknown',
        },
        cpu: {
          architecture: ua.cpu?.architecture || 'unknown',
        },
        isBot: ua.isBot || false,
      },
      referer: headersList.get('referer') || 'unknown',
      acceptLanguage: headersList.get('accept-language') || 'unknown',
    };

    // Save event to 'resume_downloads' collection in the 'portfolio' database
    const client = await getClientPromise();
    const db = client.db('portfolio');
    await db.collection('resume_downloads').insertOne(downloadEvent);

    // Update visitor_sessions if matching sessionId or recent IP session exists
    if (sessionId) {
      await db.collection('visitor_sessions').updateOne(
        { sessionId },
        {
          $set: {
            downloadedResume: true,
            resumeDownloadedAt: new Date(),
          },
        }
      );
    } else if (ip && ip !== "unknown") {
      // Find most recent session for this IP within last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      await db.collection('visitor_sessions').updateOne(
        { ip, startedAt: { $gte: twoHoursAgo } },
        {
          $set: {
            downloadedResume: true,
            resumeDownloadedAt: new Date(),
          },
        },
        { sort: { startedAt: -1 } }
      );
    }

  } catch (error) {
    // Silence errors to keep the resume accessible even if analytics logging fails
    console.error('Failed to log resume download event:', error);
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'resume.pdf');
    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('Failed to read and serve resume PDF:', error);
    return new Response('Resume file not found.', { status: 404 });
  }
}
