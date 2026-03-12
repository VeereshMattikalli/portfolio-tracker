import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { email, password, name, phoneNumber } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }
    const db = getDb();
    if (!db) {
      throw new Error("Firestore Admin not initialized");
    }

    // Check for existing user
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (!snapshot.empty) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Firestore
    const newUserRef = usersRef.doc();
    const userData = {
      email,
      passwordHash,
      name: name || null,
      phoneNumber: phoneNumber || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await newUserRef.set(userData);

    return NextResponse.json({ message: "User registered successfully", user: { id: newUserRef.id, email } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
