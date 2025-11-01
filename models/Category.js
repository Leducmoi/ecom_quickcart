import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 40
    },
    slug: { 
        type: String, 
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
