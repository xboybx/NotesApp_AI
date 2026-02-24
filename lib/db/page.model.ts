import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // which user owns this page
    title: string;
    icon?: string;  // emoji like "📝"
    coverImage?: string; // URL to cover image
    content: Record<string, unknown>[]; // BlockNote JSON content and = an ARRAY of such objects
    //Its an object with key as String Type and value is unknown type
    tags: string[]; // array of tags
    summary: string; // AI-generated summary
    isFavorite: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;


}

const pageSchema = new Schema<IPage>({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,  // index for fast "get all my pages" queries
    },
    title: {
        type: String,
        default: "Untitled",
        index: true,
    },
    icon: {
        type: String,
        default: null,
    },
    coverImage: {
        type: String,
        default: null,
    },
    content: { // array of BlockNote JSON block objects
        type: [Object],
        default: [],
    },
    tags: {
        type: [String],
        default: [],
    },
    summary: {
        type: String,
        default: null,
    },
    isFavorite: {
        type: Boolean,
        default: false,
        index: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
        index: true,
    },


}, {
    timestamps: true,
})


const Page: Model<IPage> = mongoose.models.Page || mongoose.model<IPage>("Page", pageSchema);

export default Page;