import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema({
  type: {
    type: String,
    default: "assigned",
    enum: [
      "assigned",
      "in progress",
      "completed",
      "started",
      "bug",
      "commented",
      "reviewed",
      "approved",
      "rejected",
    ],
  },
  activity: { type: String },
  date: { type: Date, default: new Date() },
  by: { type: Schema.Types.ObjectId, ref: "User" },
});

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: new Date() },
    priority: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "medium"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [activitySchema], // Changed to an array of activities
    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
      },
    ],
    assets: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
