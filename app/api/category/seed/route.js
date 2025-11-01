import connectDB from "@/config/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

const seedCategories = [
    { name: "Earphone", slug: "earphone" },
    { name: "Headphone", slug: "headphone" },
    { name: "Watch", slug: "watch" },
    { name: "Smartphone", slug: "smartphone" },
    { name: "Laptop", slug: "laptop" },
    { name: "Camera", slug: "camera" },
    { name: "Accessories", slug: "accessories" },
];

export async function POST(request) {
    try {
        await connectDB();

        // Check if categories already exist
        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json({
                success: false,
                message: "Categories already exist. Seed aborted.",
            });
        }

        // Insert categories
        const categories = await Category.insertMany(seedCategories);

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${categories.length} categories`,
            categories,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
