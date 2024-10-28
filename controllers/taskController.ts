import { Request, Response } from "express";
import Notice from "../models/notification";
import Task from "../models/task";
import User from "../models/user";
import CustomRequest from "../utils/CustomRequest";

// Helper function for error handling
const handleError = (res: Response, error: any) => {
  console.error(error);
  return res.status(400).json({ status: false, message: error.message });
};

// Create a new task
export const createTask = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const { title, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team.length - 1} others.`;
    }

    text += ` The task priority is set at ${priority} priority, so check and act accordingly. The task date is ${new Date(
      date
    ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage?.toLowerCase(),
      date,
      priority: priority?.toLowerCase(),
      assets,
      activities: [activity],
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);

    handleError(res, error);
  }
};

// Duplicate a task
export const duplicateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    const newTask = await Task.create({
      ...task.toObject(),
      title: `${task.title} - Duplicate`,
      _id: undefined, // Exclude the original ID to create a new one
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text += ` The task priority is set at ${
      task.priority
    } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

// Post an activity to a task
export const postTaskActivity = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, activity } = req.body;
    const userId = req.user?.userId;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    const data = {
      type,
      activity,
      by: userId,
    };

    if (!task.activities) {
      return res
        .status(400)
        .json({ status: false, message: "Task activities not found." });
    }

    task.activities.push(data);
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

// Get dashboard statistics
export const dashboardStatistics = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { userId, isAdmin } = req.user!;

    const tasksQuery = isAdmin
      ? { isTrashed: false }
      : { isTrashed: false, team: { $all: [userId] } };

    const allTasks = await Task.find(tasksQuery)
      .populate("team", "name role title email")
      .sort({ _id: -1 });

    const users = isAdmin
      ? await User.find({ isActive: true })
          .select("name title role isAdmin createdAt")
          .limit(10)
          .sort({ _id: -1 })
      : [];

    // Group tasks by stage
    const tasksByStage = allTasks.reduce((result: any, task) => {
      const stage = task.stage;
      result[stage] = (result[stage] || 0) + 1;
      return result;
    }, {});

    // Group tasks by priority
    const tasksByPriority = Object.entries(
      allTasks.reduce((result: any, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks.length;
    const last10Task = allTasks.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users,
      tasks: tasksByStage,
      graphData: tasksByPriority,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { stage, isTrashed } = req.query;

    const query: any = { isTrashed: isTrashed === "true" };

    if (stage) {
      query.stage = stage;
    }

    const tasks = await Task.find(query)
      .populate("team", "name title email")
      .sort({ _id: -1 });

    res.status(200).json({ status: true, tasks });
  } catch (error) {
    handleError(res, error);
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("team", "name title role email")
      .populate("activities.by", "name");

    if (!task || task.isTrashed) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    res.status(200).json({ status: true, task });
  } catch (error) {
    handleError(res, error);
  }
};

// Create a new sub-task for an existing task
export const createSubTask = async (req: Request, res: Response) => {
  try {
    const { title, tag, date } = req.body;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    const newSubTask = { title, date, tag };
    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

// Update an existing task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    task.title = title;
    task.date = date;
    task.priority = priority?.toLowerCase();
    task.assets = assets;
    task.stage = stage?.toLowerCase();
    task.team = team;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

// Trash a task
// Trash a task (Soft delete)
export const trashTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    task.isTrashed = true;
    await task.save();

    res.status(200).json({ status: true, message: "Task moved to trash." });
  } catch (error) {
    handleError(res, error);
  }
};

export const recoverTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    if (!task.isTrashed) {
      return res
        .status(400)
        .json({ status: false, message: "Task is not in trash." });
    }

    task.isTrashed = false;
    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task restored successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteRestoreTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    switch (actionType) {
      case "delete": {
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
          return res
            .status(404)
            .json({ status: false, message: "Task not found." });
        }
        return res
          .status(200)
          .json({ status: true, message: "Task permanently deleted." });
      }
      case "deleteAll": {
        const result = await Task.deleteMany({ isTrashed: true });
        return res.status(200).json({
          status: true,
          message: `${result.deletedCount} trashed tasks permanently deleted.`,
        });
      }
      case "restore": {
        const task = await Task.findById(id);
        if (!task) {
          return res
            .status(404)
            .json({ status: false, message: "Task not found." });
        }
        if (!task.isTrashed) {
          return res
            .status(400)
            .json({ status: false, message: "Task is not in trash." });
        }
        task.isTrashed = false;
        await task.save();
        return res
          .status(200)
          .json({ status: true, message: "Task restored successfully." });
      }
      case "restoreAll": {
        const result = await Task.updateMany(
          { isTrashed: true },
          { isTrashed: false }
        );
        return res.status(200).json({
          status: true,
          message: `${result.modifiedCount} tasks restored from trash.`,
        });
      }
      default:
        return res
          .status(400)
          .json({ status: false, message: "Invalid action type." });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getTrashedTasks = async (req: Request, res: Response) => {
  try {
    // Log all trashed tasks for debugging
    const trashedTasks = await Task.find({ isTrashed: true });
    console.log("Trashed Tasks:", trashedTasks); // Add this line

    res.status(200).json({
      status: true,
      message: "Trashed tasks fetched successfully.",
      data: trashedTasks,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch trashed tasks.",
    });
  }
};
