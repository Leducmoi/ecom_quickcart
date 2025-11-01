import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Category from "@/models/Category";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized! Only sellers can view categories.",
            });
        }

        await connectDB();

        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json({ success: true, categories });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
