import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    // Clerk user id is a string (e.g. user_...); keep as String but reference User model name
    userId : { type: String, required: true, ref: 'User' },
    items : [{
        // store ObjectId references to Product so we can populate product details
        product : { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity : { type: Number, required: true  },
    }],
    amount : { type: Number, required: true  },
    // address should reference Address model by ObjectId
    address : { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Address'  },
    status : { type: String, required: true, default: 'Order Placed'  },
    date : { type: Date, default: Date.now },

})

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;