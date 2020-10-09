const Team = require("../models/Team");
const Goal = require("../models/Goal");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const newGoal = await Goal.create(req.body);
    await Promise.all([
      Team.findByIdAndUpdate(newGoal.goalFor, {
        $push: {
          goalsScored: newGoal._id,
        },
      }),
      Team.findByIdAndUpdate(newGoal.goalAgainst, {
        $push: {
          goalsConceded: newGoal._id,
        },
      }),
    ]);

    const goalPopulated = await newGoal
      .populate("goalFor", "name code flag")
      .populate("goalAgainst", "name code flag")
      .execPopulate();

    res.json({
      count: 1,
      value: goalPopulated,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const goals = await Goal.find()
      .populate("goalFor", "name code flag")
      .populate("goalAgainst", "name code flag")
      .lean();

    res.json({
      count: goals.length,
      value: goals,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:goalId", async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.goalId)
      .populate("goalFor", "name code flag")
      .populate("goalAgainst", "name code flag")
      .lean();

    if (goal) {
      res.json({
        count: 1,
        value: goal,
      });
    } else {
      res.status(404).json({
        error: "No hay equipo con este ID",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:goalId", async (req, res, next) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.goalId)
      .populate("goalFor", "name code flag")
      .populate("goalAgainst", "name code flag")
      .lean();

    await Promise.all([
      Team.findByIdAndUpdate(deletedGoal.goalFor, {
        $pull: {
          goalsScored: deletedGoal._id,
        },
      }),
      Team.findByIdAndUpdate(deletedGoal.goalAgainst, {
        $pull: {
          goalsConceded: deletedGoal._id,
        },
      }),
    ]);

    res.json({
      count: 1,
      value: deletedGoal,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:goalId", async (req, res, next) => {
  try {
    const goalId = req.params.goalId;
    const patchData = req.body;

    const outdatedGoal = await Goal.findByIdAndUpdate(goalId, patchData, {
      runValidators: true,
    });

    if (!outdatedGoal) {
      return res.status(404).json({
        error: "No hay equipo con este ID",
      });
    }

    // update teams
    await Promise.all([
      Team.findByIdAndUpdate(outdatedGoal.goalFor, {
        $pull: {
          goalsScored: goalId,
        },
      }),
      Team.findByIdAndUpdate(outdatedGoal.goalAgainst, {
        $pull: {
          goalsConceded: goalId,
        },
      }),
      Team.findByIdAndUpdate(patchData.goalFor, {
        $push: {
          goalsScored: goalId,
        },
      }),
      Team.findByIdAndUpdate(patchData.goalAgainst, {
        $push: {
          goalsConceded: goalId,
        },
      }),
    ]);

    const updatedGoal = await Goal.findById(goalId)
      .populate("goalFor", "name code flag")
      .populate("goalAgainst", "name code flag");

    res.json({
      count: 1,
      value: updatedGoal,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
