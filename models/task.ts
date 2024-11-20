import mongoose, { Schema, Document } from "mongoose";

interface SubTask {
  title: string;
  date: Date;
  tag: string;
}

interface Activity {
  type: string;
  activity: string;
  by: mongoose.Schema.Types.ObjectId;
}

export interface TaskDocument extends Document {
  title: string;
  team: mongoose.Schema.Types.ObjectId[];
  stage: string;
  date: Date;
  priority: string;
  assets: string[];
  subTasks: SubTask[];
  activities: Activity[];
  isTrashed: boolean;
}

const SubTaskSchema = new Schema<SubTask>({
  title: { type: String, required: true },
  date: { type: Date, required: false },
  tag: { type: String, required: false },
});

const ActivitySchema = new Schema<Activity>({
  type: { type: String, required: true },
  activity: { type: String, required: true },
  by: { type: Schema.Types.ObjectId, ref: "User" },
});

const TaskSchema = new Schema<TaskDocument>({
  title: { type: String, required: true },
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  stage: { type: String, required: true },
  date: { type: Date, required: true },
  priority: { type: String, required: true },
  assets: [{ type: String }],
  subTasks: [SubTaskSchema],
  activities: [ActivitySchema],
  isTrashed: { type: Boolean, default: false },
});

export default mongoose.model<TaskDocument>("Task", TaskSchema);
