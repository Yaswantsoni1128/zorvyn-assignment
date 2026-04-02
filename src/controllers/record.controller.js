import Record from "../models/record.model.js";
import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const recordController = {
  create: asyncHandler(async (req, res) => {
    let { amount, type, category, categoryId, date, note } = req.body;

    if (amount === undefined || !type || (!category && !categoryId) || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    amount = Number(amount);
    if (Number.isNaN(amount) || amount < 0)
      return res.status(400).json({ message: "Invalid amount" });

    // Resolve categoryId: accept existing categoryId or a category name (create if missing)
    let finalCategoryId = null;

    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId))
        return res.status(400).json({ message: "Invalid categoryId" });
      const cat = await Category.findOne({
        _id: categoryId,
        userId: req.user._id,
      });
      if (!cat) return res.status(400).json({ message: "Category not found" });
      if (cat.type !== type)
        return res.status(400).json({ message: "Category type mismatch" });
      finalCategoryId = cat._id;
    } else {
      const name = String(category).trim().toLowerCase();
      let cat = await Category.findOne({ name, type, userId: req.user._id });
      if (!cat)
        cat = await Category.create({ name, type, userId: req.user._id });
      finalCategoryId = cat._id;
    }

    const record = await Record.create({
      userId: req.user._id,
      amount,
      type,
      categoryId: finalCategoryId,
      date: new Date(date),
      note,
    });

    const populated = await Record.findById(record._id).populate(
      "categoryId",
      "name type",
    );

    res.status(201).json({ record: populated });
  }),

  getAll: asyncHandler(async (req, res) => {
    let { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    // safety limit
    limit = Math.min(limit, 50);

    const filter = {
      userId: req.user._id,
      isDeleted: false,
    };

    if (type) filter.type = type;

    // category filter (name OR id)
    if (category) {
      if (mongoose.isValidObjectId(category)) {
        filter.categoryId = category;
      } else {
        const cats = await Category.find({
          name: category.toLowerCase(),
          userId: req.user._id,
        });
        const ids = cats.map((c) => c._id);
        filter.categoryId = { $in: ids };
      }
    }

    // date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name type"),
      Record.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      records,
    });
  }),

  getOne: asyncHandler(async (req, res) => {
    const record = await Record.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    }).populate("categoryId", "name type");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ record });
  }),

  update: asyncHandler(async (req, res) => {
    const allowedUpdates = [
      "amount",
      "type",
      "category",
      "categoryId",
      "date",
      "note",
    ];
    const updates = {};

    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // handle amount and date conversions
    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
      if (Number.isNaN(updates.amount) || updates.amount < 0)
        return res.status(400).json({ message: "Invalid amount" });
    }
    if (updates.date) updates.date = new Date(updates.date);

    // handle category: allow name or categoryId
    if (updates.category) {
      const name = String(updates.category).trim().toLowerCase();
      let cat = await Category.findOne({ name, userId: req.user._id });
      if (!cat) {
        // need type to create/find category; prefer provided type or existing record's type
        const targetRecord = await Record.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });
        const requiredType =
          updates.type || (targetRecord && targetRecord.type);
        if (!requiredType)
          return res
            .status(400)
            .json({ message: "Type required to create new category" });
        if (!["income", "expense"].includes(requiredType))
          return res.status(400).json({ message: "Invalid type" });
        cat = await Category.create({
          name,
          type: requiredType,
          userId: req.user._id,
        });
      }
      updates.categoryId = cat._id;
      delete updates.category;
    }

    // if categoryId provided directly
    if (req.body.categoryId) {
      if (!mongoose.isValidObjectId(req.body.categoryId))
        return res.status(400).json({ message: "Invalid categoryId" });
      const cat = await Category.findOne({
        _id: req.body.categoryId,
        userId: req.user._id,
      });
      if (!cat) return res.status(400).json({ message: "Category not found" });
      updates.categoryId = cat._id;
    }

    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        isDeleted: false,
      },
      updates,
      { new: true },
    ).populate("categoryId", "name type");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true },
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record deleted" });
  }),
};
