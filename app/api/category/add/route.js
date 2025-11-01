import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Category from "@/models/Category";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized! Only sellers can add categories.",
            });
        }

        const { name, slug } = await request.json();

        // Validation
        if (!name || name.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: "Category name is required.",
            });
        }

        if (name.length > 40) {
            return NextResponse.json({
                success: false,
                message: "Category name must not exceed 40 characters.",
            });
        }

        // Validate name: only letters, numbers, and spaces
        const nameRegex = /^[a-zA-Z0-9\s]+$/;
        if (!nameRegex.test(name)) {
            return NextResponse.json({
                success: false,
                message: "Category name can only contain letters, numbers, and spaces.",
            });
        }

        if (!slug || slug.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: "Category slug is required.",
            });
        }

        await connectDB();

        // Check if slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return NextResponse.json({
                success: false,
                message: "Category with this slug already exists.",
            });
        }

        const newCategory = await Category.create({
            name: name.trim(),
            slug: slug.trim(),
        });

        return NextResponse.json({
            success: true,
            message: "Category added successfully",
            category: newCategory,
        });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: "Category with this slug already exists.",
            });
        }
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
