import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const categoryController = {
  create: asyncHandler(async (req, res) => {
    let { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type required" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    name = name.trim().toLowerCase();

    const existing = await Category.findOne({
      name,
      type,
      userId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      type,
      userId: req.user._id,
    });

    res.status(201).json({ category });
  }),

  getAll: asyncHandler(async (req, res) => {
    const { type } = req.query;

    const filter = {
      userId: req.user._id,
    };

    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.json({ categories });
  }),

  delete: asyncHandler(async (req, res) => {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  }),
};