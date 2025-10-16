import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs"; // Puppeteer requires Node.js runtime

export async function POST(request: Request) {
  const { url } = await request.json();
  const cookieHeader = request.headers.get("cookie") || "";
  const domain = new URL(url).hostname;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page = await browser.newPage();

  const puppeteerCookies = cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    const value = rest.join("=");
    return { name, value, domain, path: "/" };
  });

  await page.setCookie(...puppeteerCookies);
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.emulateMediaType("screen");

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", right: "5mm", bottom: "10mm", left: "5mm" },
    scale: 0.8,
  });

  await browser.close();

  // Convert Uint8Array to Node.js Buffer explicitly
  const buffer = Buffer.from(pdfBuffer);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=seite.pdf",
    },
  });
}
