import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  // URL vom Client erhalten
  const { url } = await request.json();

  // Session-Cookies aus dem Request-Header auslesen (nicht vom Client-Body)
  const cookieHeader = request.headers.get("cookie") || "";

  // Domain aus URL extrahieren, wichtig für Puppeteer-Cookies
  const domain = new URL(url).hostname;

  // Puppeteer starten
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page = await browser.newPage();

  // Cookies aus Header parsen und für Puppeteer anpassen
  const puppeteerCookies = cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    const value = rest.join("=");
    return { name, value, domain, path: "/" };
  });

  // Cookies in Puppeteer setzen
  await page.setCookie(...puppeteerCookies);

  // Seite mit Session laden
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.emulateMediaType("screen");

  // PDF erstellen
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", right: "5mm", bottom: "10mm", left: "5mm" },
    scale: 0.8,
  });

  await browser.close();

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=seite.pdf",
    },
  });
}
