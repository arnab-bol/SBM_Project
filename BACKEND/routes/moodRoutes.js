
const express = require('express');

const router = express.Router();

const {

  getMoods,
  createMood,
  updateMood,
  deleteMood,

} = require('../controllers/moodController');


router.route('/')

  .get(getMoods)

  .post(createMood);


router.route('/:id')

  .put(updateMood)

  .delete(deleteMood);


module.exports = router;

