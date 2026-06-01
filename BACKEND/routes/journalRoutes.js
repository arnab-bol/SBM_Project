
const express = require('express');

const router = express.Router();

const {

  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,

} = require('../controllers/journalController');


router.route('/')

  .get(getJournals)

  .post(createJournal);


router.route('/:id')

  .put(updateJournal)

  .delete(deleteJournal);


module.exports = router;

