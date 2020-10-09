const Team = require('../models/Team');
const { makeSortCriteria } = require('../utils');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || '';
    const order = parseInt(req.query.order, 10) || 1;
    const skip = parseInt(req.query.skip, 10) || 0;
    const sortCriteria = makeSortCriteria(sortBy, order);

    const docs = await Team.find()
      .populate('goalsScored', 'author minute')
      .populate('goalsConceded', 'author minute')
      .sort(sortCriteria)
      .skip(skip)
      .lean();

    res.json({
      count: docs.length,
      value: docs,
    });
  } catch (error) {
    throw error;
  }
});

router.get('/:teamId', async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const include = req.query.include;
    const exclude = req.query.exclude;

    const doc = await Team.findById(teamId)
      .populate('goalsScored', 'author minute')
      .populate('goalsConceded', 'author minute')
      .select(include || exclude)
      .lean();

    if (doc) {
      res.json({
        count: 1,
        value: doc,
      });
    } else {
      res.status(404).json({
        error: 'No hay equipo con este ID',
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const team = req.body;

    const doc = await Team.create(team);

    res.status(201).json({
      count: 1,
      value: doc,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:teamId', async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const updatePayload = req.body;

    const doc = await Team.findByIdAndUpdate(teamId, updatePayload, {
      new: true,
      runValidators: true,
    })
      .populate('goalsScored', 'author minute')
      .populate('goalsConceded', 'author minute')
      .lean();

    if (doc) {
      res.json({
        count: 1,
        value: doc,
      });
    } else {
      res.status(404).json({
        error: 'No hay equipo con este ID',
      });
    }
  } catch (error) {
    next(error);
  }
});

router.patch('/:teamId', async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    const updatePayload = req.body;

    const doc = await Team.findByIdAndUpdate(teamId, updatePayload, {
      new: true,
      runValidators: true,
    })
      .populate('goalsScored', 'author minute')
      .populate('goalsConceded', 'author minute')
      .lean();

    if (doc) {
      res.json({
        count: 1,
        value: doc,
      });
    } else {
      throw new Error('No hay equipo con este ID');
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:teamId', async (req, res, next) => {
  try {
    const teamId = req.params.teamId;

    const doc = await Team.findByIdAndDelete(teamId)
      .populate('goalsScored', 'author minute')
      .populate('goalsConceded', 'author minute')
      .lean();

    if (doc) {
      res.json({
        count: 1,
        value: doc,
      });
    } else {
      res.status(404).json({
        error: 'No hay equipo con este ID',
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
