import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
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
    const itemTotals = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        return product.offerPrice * item.quantity;
      })
    );

    const amount = itemTotals.reduce((acc, val) => acc + val, 0);
    const totalAmount = amount + Math.floor(amount * 0.02);

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        items,
        address,
        amount: totalAmount,
        date: Date.now(),
      },
    });

    // clear user cart

    const user = await User.findById(userId);
    user.cartItems = [];
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order.",
      },
      { status: 500 }
    );
  }
}
