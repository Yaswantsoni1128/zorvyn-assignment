import Record from "../models/record.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardController = {
  getSummary: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Total Income & Expense
    const totals = await Record.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    totals.forEach((t) => {
      if (t._id === "income") income = t.total;
      if (t._id === "expense") expense = t.total;
    });

    const netBalance = income - expense;

    // Category-wise breakdown
    const categoryStats = await Record.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 0,
          category: "$category.name",
          total: 1,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Monthly trends
    const monthlyStats = await Record.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    //  Recent transactions 
    const recentRaw = await Record.find({
      userId,
      isDeleted: false,
    })
      .populate("categoryId", "name")
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const recent = recentRaw.map((r) => ({
      _id: r._id,
      amount: r.amount,
      type: r.type,
      category: r.categoryId?.name || null,
      date: r.date,
      note: r.note,
    }));

    res.json({
      summary: {
        totalIncome: income,
        totalExpense: expense,
        netBalance,
      },
      categoryStats,
      monthlyStats,
      recent,
    });
  }),
};