import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { inngest } from "@/config/inngest";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid order data.",
      });
    }

    await connectDB();

    // Tính tổng tiền
    const itemTotals = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return product.offerPrice * item.quantity;
      })
    );

    const amount = itemTotals.reduce((acc, val) => acc + val, 0);
    const totalAmount = amount + Math.floor(amount * 0.02);

    // Tạo order trực tiếp trong DB
    const order = await Order.create({
      userId,
      items,
      address, // phải là ObjectId của Address
      amount: totalAmount,
      date: new Date(),
    });

    // Gửi event async nếu cần (ví dụ gửi email)
    await inngest.send({
      name: "order/created",
      data: {
        orderId: order._id,
        userId,
        amount: totalAmount,
      },
    });

    // Xóa giỏ hàng người dùng
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order." },
      { status: 500 }
    );
  }
}
