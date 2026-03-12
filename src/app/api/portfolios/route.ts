import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const db = getDb();
    if (!db) {
      throw new Error("Firestore Admin not initialized");
    }

    // Query portfolios collection where userId matches
    const portfoliosSnapshot = await db.collection("portfolios").where("userId", "==", userId).get();
    
    // In Firestore, we also need to fetch sub-collections manually if we want the full nested object
    const portfolios = await Promise.all(portfoliosSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const portfolioId = doc.id;
      
      const assetsSnapshot = await db.collection("portfolios").doc(portfolioId).collection("assets").get();
      const assets = assetsSnapshot.docs.map(aDoc => ({ id: aDoc.id, ...aDoc.data() }));

      return {
        id: portfolioId,
        ...data,
        assets
      };
    }));

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Portfolio name is required" }, { status: 400 });
    }
    const db = getDb();
    if (!db) {
      throw new Error("Firestore Admin not initialized");
    }

    const newPortfolioRef = db.collection("portfolios").doc();
    const portfolioData = {
      name,
      description: description || null,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newPortfolioRef.set(portfolioData);

    return NextResponse.json({ id: newPortfolioRef.id, ...portfolioData, assets: [] }, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
