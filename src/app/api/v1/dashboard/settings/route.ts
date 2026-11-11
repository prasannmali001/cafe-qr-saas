import { NextRequest, NextResponse } from "next/server";

export interface CafeSecuritySettings {
  requireTablePin: boolean;
  tablePin: string;
  cooldownHours: number;
}

// In-memory security settings state (persists per server instance / configurable by cafe owner)
let securitySettings: CafeSecuritySettings = {
  requireTablePin: false, // Default: frictionless. Owner can toggle ON under active spam attacks.
  tablePin: "24", // Default 2-digit PIN displayed on table standee
  cooldownHours: 24,
};

export async function GET(): Promise<NextResponse<CafeSecuritySettings>> {
  return NextResponse.json(securitySettings, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const payload = body as Partial<CafeSecuritySettings>;

  securitySettings = {
    requireTablePin:
      typeof payload.requireTablePin === "boolean"
        ? payload.requireTablePin
        : securitySettings.requireTablePin,
    tablePin: payload.tablePin?.trim() || securitySettings.tablePin,
    cooldownHours:
      typeof payload.cooldownHours === "number"
        ? payload.cooldownHours
        : securitySettings.cooldownHours,
  };

  return NextResponse.json(
    { success: true, settings: securitySettings },
    { status: 200 }
  );
}

