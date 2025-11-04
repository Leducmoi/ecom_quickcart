'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const AllProducts = () => {

    const { products } = useAppContext();

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPrice, setSelectedPrice] = useState(""); // UI only for now

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/category/list');
                if (data.success) {
                    setCategories(data.categories);
                }
            } catch (error) {
                // no-op: keep UI functional even if categories fail to load
            }
        };
        fetchCategories();
    }, []);

    const filteredProducts = useMemo(() => {
        // Step 1: filter by category (if selected)
        const byCategory = selectedCategory
            ? products.filter((p) => p.category === selectedCategory)
            : products;

        // Step 2: sort by price (UI selection)
        if (!selectedPrice) return byCategory;

        const getEffectivePrice = (p) => {
            const hasOffer = typeof p.offerPrice === 'number' && !Number.isNaN(p.offerPrice);
            const hasPrice = typeof p.price === 'number' && !Number.isNaN(p.price);
            if (hasOffer) return p.offerPrice;
            if (hasPrice) return p.price;
            return 0;
        };

        const sorted = [...byCategory].sort((a, b) => {
            const pa = getEffectivePrice(a);
            const pb = getEffectivePrice(b);
            if (selectedPrice === 'low_to_high') return pa - pb;
            if (selectedPrice === 'high_to_low') return pb - pa;
            return 0;
        });

        return sorted;
    }, [products, selectedCategory, selectedPrice]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                <div className="flex flex-col items-end pt-12 w-full">
                    <p className="text-2xl font-medium">All products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mt-6 w-full">
                    {/* Category filter (same style as Add Product select) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="filter-category">Category</label>
                        <select
                            id="filter-category"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            value={selectedCategory}
                        >
                            <option value="">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price filter (UI only for now) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="filter-price">Price</label>
                        <select
                            id="filter-price"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            onChange={(e) => setSelectedPrice(e.target.value)}
                            value={selectedPrice}
                        >
                            <option value="">Any</option>
                            <option value="low_to_high">Low to High</option>
                            <option value="high_to_low">High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                    {filteredProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;
