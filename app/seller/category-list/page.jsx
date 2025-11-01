'use client'
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const CategoryList = () => {
  const { router, user, getToken } = useAppContext()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Function to format slug from name
  const formatSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  const fetchCategories = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/category/seller-list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(data.success){
        setCategories(data.categories)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const { data } = await axios.post("/api/category/add", 
        { name, slug },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setName("");
        setSlug("");
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/category/delete/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        setDeleteConfirm(null);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4 space-y-6">
          <h2 className="pb-4 text-lg font-medium">Category Management</h2>
          
          {/* Add Category Form */}
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="category-name">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                placeholder="Type here"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => {
                  const value = e.target.value;
                  setName(value);
                  setSlug(formatSlug(value));
                }}
                value={name}
                required
                maxLength={40}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium" htmlFor="category-slug">
                Slug (auto-generated)
              </label>
              <input
                id="category-slug"
                type="text"
                placeholder="slug-will-appear-here"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 bg-gray-100"
                value={slug}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug is automatically generated from category name
              </p>
            </div>
            <button
              type="submit"
              className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded"
            >
              ADD CATEGORY
            </button>
          </form>

          {/* Categories List */}
          <div>
            <h3 className="pb-4 text-base font-medium">All Categories</h3>
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
              <table className="table-fixed w-full overflow-hidden">
                <thead className="text-gray-900 text-sm text-left">
                  <tr>
                    <th className="w-1/3 px-4 py-3 font-medium truncate">Name</th>
                    <th className="w-1/3 px-4 py-3 font-medium truncate">Slug</th>
                    <th className="px-4 py-3 font-medium truncate">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {categories.map((category) => (
                    <tr key={category._id} className="border-t border-gray-500/20">
                      <td className="px-4 py-3">{category.name}</td>
                      <td className="px-4 py-3 truncate">{category.slug}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirm(category)}
                          className="px-3.5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No categories found. Add your first category above.
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the category "{deleteConfirm.name}"? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default CategoryList;
