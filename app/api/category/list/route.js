import connectDB from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
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
