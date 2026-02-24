import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    image?: string;
    emailVerified?: Date;
    createdAt: Date;
    updatedAt: Date;

}


const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,       // no duplicate emails
        lowercase: true,
        trim: true,
    },
    image: {
        type: String,
        default: null,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true, // auto-adds createdAt + updatedAt
    }
)


// Prevent model re-registration on hot reload
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;