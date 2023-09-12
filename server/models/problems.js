const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  codeTemplate: {
    cpp: [
      {
        driverStart: {
          type: String,
        },
        driverEnd: {
          type: String,
        },
        codeStart: {
          type: String,
          required: true,
        },
      },
    ],
    java: [
      {
        driverStart: {
          type: String,
        },
        driverEnd: {
          type: String,
        },
        codeStart: {
          type: String,
          required: true,
        },
      },
    ],
    python: [
      {
        driverStart: {
          type: String,
        },
        driverEnd: {
          type: String,
        },
        codeStart: {
          type: String,
          required: true,
        },
      },
    ],
  },
  visibleTestcases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
  invisibleTestcases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
});

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
