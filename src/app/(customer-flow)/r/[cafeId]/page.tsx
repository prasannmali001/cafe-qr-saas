import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CustomerReviewClient,
  CafeData,
} from "@/components/customer/CustomerReviewClient";

interface PageProps {
  params: Promise<{ cafeId: string }>;
  searchParams: Promise<{ s?: string }>;
}

const DEMO_CAFE: CafeData = {
  id: "demo-roast-pune-id",
  name: "The Roast Cafe",
  slug: "roast-pune",
  googlePlaceId: "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
  logoUrl:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=120&h=120&fit=crop",
  rewardText: "10% OFF on your next coffee!",
};

export default async function CustomerReviewPage({
  params,
  searchParams,
}: PageProps) {
  const { cafeId } = await params;
  const { s: staffCode } = await searchParams;

  let cafe: CafeData | null = null;
  let staffName: string | undefined = undefined;

  // Local Dev / Demo Fallback Mode
  if (cafeId === "demo-roast-pune-id" || cafeId === "roast-pune") {
    cafe = DEMO_CAFE;
    if (staffCode === "rahul01") staffName = "Rahul Sharma";
    if (staffCode === "priya02") staffName = "Priya Patel";
  } else {
    try {
      // 1. Try finding Cafe by UUID or Slug
      const dbCafe = await prisma.cafe.findFirst({
        where: {
          OR: [{ id: cafeId }, { slug: cafeId.toLowerCase() }],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          googlePlaceId: true,
          logoUrl: true,
          rewardText: true,
        },
      });

      if (dbCafe) {
        cafe = dbCafe;

        // 2. Look up Staff Name if staffCode provided
        if (staffCode) {
          const staff = await prisma.staffMember.findFirst({
            where: {
              cafeId: dbCafe.id,
              staffCode: staffCode,
              isActive: true,
            },
            select: { name: true },
          });
          if (staff) {
            staffName = staff.name;
          }
        }
      } else {
        // If not found in DB, fallback to Demo Cafe during dev
        cafe = DEMO_CAFE;
      }
    } catch (dbError: unknown) {
      console.warn("Database lookup failed in /r/[cafeId], using dev fallback:", dbError);
      cafe = DEMO_CAFE;
      if (staffCode === "rahul01") staffName = "Rahul Sharma";
      if (staffCode === "priya02") staffName = "Priya Patel";
    }
  }

  if (!cafe) {
    notFound();
  }

  return (
    <CustomerReviewClient
      cafe={cafe}
      staffCode={staffCode}
      staffName={staffName}
    />
  );
}

