// import mongoose from "mongoose";

// const privacySchema = new mongoose.Schema(
//     {
//       content: {
//         type: String,
//         required: true,
//       },
//     },
//     { timestamps: true }
//   );
// export default mongoose.model("Privacy", privacySchema);


import mongoose from "mongoose";

const privacySchema = new mongoose.Schema(
  {
    policies: {
      type: Map,
      of: String,
      default: () => new Map(), // Store country-code:content pairs
    },
  },
  { timestamps: true }
);

export default mongoose.model("Privacy", privacySchema);