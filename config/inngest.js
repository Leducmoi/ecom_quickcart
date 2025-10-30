import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to database
export const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk' },
    {event : 'clerk/user.created' },
    async ({event}) => {
        const {id , first_name , last_name, email_addresses, image_url} = event.data
        const userData = {
            _id : id,
            email : email_addresses[0].email_address,
            name : first_name + " " + last_name,
            imageUrl : image_url,
        }
        await connectDB();
        await User.create(userData);
    }
)

// Inngest Function to update user in database
export const syncUserUpdate = inngest.createFunction(
    {id: 'user-update-from-clerk' },
    {event : 'clerk/user.updated' },
    async ({event}) => {
        const {id , first_name , last_name, email_addresses, image_url} = event.data
        const userData = {
            name : first_name + " " + last_name,
            email : email_addresses[0].email_address,
            imageUrl : image_url,
        }
        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    }
)

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
    {id: 'user-deletion-from-clerk' },
    {event : 'clerk/user.deleted' },
    async ({event}) => {
        const {id} = event.data
        await connectDB();
        await User.findByIdAndDelete(id);
    }
)


// Inngest Function to create user's order in database
export const createUserOrder = inngest.createFunction(
    {   
        id: 'create-user-order',
        batchEvents : {
            maxSize : 5,
            timeout : '5s'
        }
     },
    {event : 'order/created' },
    async ({events}) => {

        const order = events.map((event) => {
            return {
                userId : event.data.userId,
                items : event.data.items,
                amount : event.data.amount,
                address : event.data.address,
                date : event.data.date
            }
        })

        await connectDB();
        await order.insertMany(order);

        return { success : true, processed : order.length }

    }

)