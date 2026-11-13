import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "global",
    },
    content: {
      type: String,
      default: "",
    },
    headings: {
      type: String,
      default: "[]",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);