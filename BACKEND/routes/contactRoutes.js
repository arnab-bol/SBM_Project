
const express = require('express');

const router = express.Router();

const {

  getContacts,
  createContact,
  deleteContact,

} = require('../controllers/contactController');


router.route('/')

  .get(getContacts)

  .post(createContact);


router.route('/:id')

  .delete(deleteContact);


module.exports = router;

