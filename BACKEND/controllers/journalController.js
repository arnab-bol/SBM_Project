
const Journal = require('../models/Journal');

const getJournals = async (req, res) => {

  try {

    const { userId } = req.body;

    const journals = await Journal.find({
      userId
    }).sort({ createdAt: -1 });

    res.status(200).json(journals);

  } catch (error) {

    res.status(500).json({
      message: 'Failed to fetch journals',
      error: error.message
    });

  }

};

const createJournal = async (req, res) => {

  try {

    const {
      title,
      body,
      userId
    } = req.body;

    if (!title && !body) {

      return res.status(400).json({
        message: 'Title or body is required'
      });

    }

    const newJournal = await Journal.create({

      userId,
      title: title || 'Untitled',
      body: body || '',

    });

    res.status(201).json(newJournal);

  } catch (error) {

    res.status(500).json({
      message: 'Failed to create journal',
      error: error.message
    });

  }

};

const updateJournal = async (req, res) => {

  try {

    const {
      title,
      body
    } = req.body;

    const updatedJournal =
      await Journal.findByIdAndUpdate(

      req.params.id,

      {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
      },

      {
        new: true,
        runValidators: true
      }

    );

    if (!updatedJournal) {

      return res.status(404).json({
        message: 'Journal not found'
      });

    }

    res.status(200).json(updatedJournal);

  } catch (error) {

    if (error.name === 'CastError') {

      return res.status(400).json({
        message: 'Invalid journal id'
      });

    }

    res.status(500).json({
      message: 'Failed to update journal',
      error: error.message
    });

  }

};

const deleteJournal = async (req, res) => {

  try {

    const deletedJournal =
      await Journal.findByIdAndDelete(req.params.id);

    if (!deletedJournal) {

      return res.status(404).json({
        message: 'Journal not found'
      });

    }

    res.status(200).json({
      message: 'Journal deleted successfully',
      journal: deletedJournal,
    });

  } catch (error) {

    if (error.name === 'CastError') {

      return res.status(400).json({
        message: 'Invalid journal id'
      });

    }

    res.status(500).json({
      message: 'Failed to delete journal',
      error: error.message
    });

  }

};

module.exports = {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
};

