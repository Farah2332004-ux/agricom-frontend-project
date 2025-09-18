// src/app/api/weather/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat") ?? "52.52";   // Berlin
  const lon = url.searchParams.get("lon") ?? "13.405";
  const tz  = url.searchParams.get("tz")  ?? "Europe/Berlin";

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max` +
    `&forecast_days=16&timezone=${encodeURIComponent(tz)}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
