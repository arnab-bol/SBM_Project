
const Mood = require('../models/Mood');

const getMoods = async (req, res) => {

    try {



        const moods =
            await Mood.find({
                userId: req.query.userId
            }).sort({ createdAt: -1 });





        res.status(200).json(moods);

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch moods',
            error: error.message
        });

    }

};

const createMood = async (req, res) => {

    try {


        const {
            mood,
            emoji,
            note,
            userId,
            userName,
            userEmail
        } = req.body;



        if (!mood || !emoji) {

            return res.status(400).json({
                message: 'Mood and emoji are required'
            });

        }


        const newMood = await Mood.create({

            userId,

            userName,

            userEmail,

            mood,

            emoji,

            note: note || '',

        });


        res.status(201).json(newMood);

    } catch (error) {

        res.status(500).json({
            message: 'Failed to create mood',
            error: error.message
        });

    }

};

const updateMood = async (req, res) => {

    try {

        const {
            mood,
            emoji,
            note
        } = req.body;

        const updatedMood = await Mood.findByIdAndUpdate(

            req.params.id,

            {
                ...(mood !== undefined && { mood }),
                ...(emoji !== undefined && { emoji }),
                ...(note !== undefined && { note }),
            },

            {
                new: true,
                runValidators: true
            }

        );

        if (!updatedMood) {

            return res.status(404).json({
                message: 'Mood not found'
            });

        }

        res.status(200).json(updatedMood);

    } catch (error) {

        if (error.name === 'CastError') {

            return res.status(400).json({
                message: 'Invalid mood id'
            });

        }

        res.status(500).json({
            message: 'Failed to update mood',
            error: error.message
        });

    }

};

const deleteMood = async (req, res) => {

    try {

        const deletedMood =
            await Mood.findByIdAndDelete(req.params.id);

        if (!deletedMood) {

            return res.status(404).json({
                message: 'Mood not found'
            });

        }

        res.status(200).json({
            message: 'Mood deleted successfully',
            mood: deletedMood
        });

    } catch (error) {

        if (error.name === 'CastError') {

            return res.status(400).json({
                message: 'Invalid mood id'
            });

        }

        res.status(500).json({
            message: 'Failed to delete mood',
            error: error.message
        });

    }

};

module.exports = {
    getMoods,
    createMood,
    updateMood,
    deleteMood,
};

