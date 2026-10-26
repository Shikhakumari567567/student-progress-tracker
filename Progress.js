
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true
    },

    courseName: {
      type: String,
      required: true,
      trim: true
    },

    completionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
