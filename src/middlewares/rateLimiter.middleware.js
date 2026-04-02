import rateLimit from "express-rate-limit";

const baseConfig = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
};

export const rateLimiter = {
  auth: rateLimit({
    ...baseConfig,
    max: 10,
    message: {
      success: false,
      message: "Too many login/register attempts, try again later",
    },
  }),

  record: rateLimit({
    ...baseConfig,
    max: 100,
    message: {
      success: false,
      message: "Too many record requests, try again later",
    },
  }),

  category: rateLimit({
    ...baseConfig,
    max: 50,
    message: {
      success: false,
      message: "Too many category requests",
    },
  }),

  dashboard: rateLimit({
    ...baseConfig,
    max: 30,
    message: {
      success: false,
      message: "Too many dashboard requests",
    },
  }),

  global: rateLimit({
    ...baseConfig,
    max: 200,
    message: {
      success: false,
      message: "Too many requests globally",
    },
  }),
};