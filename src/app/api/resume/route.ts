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
    const country = headersList.get('x-vercel-ip-country') || 'unknown';
    const region = headersList.get('x-vercel-ip-country-region') || 'unknown';
    const city = headersList.get('x-vercel-ip-city') || 'unknown';
    const latitude = headersList.get('x-vercel-ip-latitude') || 'unknown';
    const longitude = headersList.get('x-vercel-ip-longitude') || 'unknown';

    // Parse User-Agent using Next.js helper
    const ua = userAgent(request);

    // Build log document
    const downloadEvent = {
      timestamp: new Date(),
      ip,
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
