import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId : { type: String, required: true, ref : 'user' },
    items : [{
        product : { type: String, required: true, ref : 'product' },
        quantity : { type: Number, required: true  },
    }],
    amount : { type: Number, required: true  },
    address : { type: String, required: true, ref : 'address'  },
    status : { type: String, required: true, default: 'Order Placed'  },
    date : { type: Number, default: true },

})

const Order = mongoose.models.Order || mongoose.model('order', OrderSchema);
export default Order;