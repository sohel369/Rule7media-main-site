// import mongoose from "mongoose";

// const termsSchema = new mongoose.Schema({
//   content: {
//     type: String,
//     required: true,
//   },
// }, { timestamps: true });

// const Terms = mongoose.model("Terms", termsSchema);
// export default Terms;



import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    terms: {
      type: Map,
      of: String,
      default: () => new Map(), 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Terms", termsSchema);