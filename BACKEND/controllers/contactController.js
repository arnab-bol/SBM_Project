
const Contact = require('../models/Contact');


const getContacts = async (req, res) => {

    try {

        const userId = req.query.userId;

        const contacts = await Contact.find({
            userId
        }).sort({ createdAt: -1 });

        res.status(200).json(contacts);

    } catch (error) {

        res.status(500).json({
            message: 'Failed to fetch contacts',
            error: error.message
        });

    }

};



const createContact = async (req, res) => {

    try {


        const {
            name,
            phone,
            userId,
            userName,
            userEmail
        } = req.body;



        if (!name) {

            return res.status(400).json({
                message: 'Name is required'
            });

        }

        const newContact = await Contact.create({

            userId,

            userName,

            userEmail,

            name,

            phone: phone || '',

        });



        res.status(201).json(newContact);

    } catch (error) {

        res.status(500).json({
            message: 'Failed to create contact',
            error: error.message
        });

    }

};

const deleteContact = async (req, res) => {

    try {

        const deletedContact =
            await Contact.findByIdAndDelete(req.params.id);

        if (!deletedContact) {

            return res.status(404).json({
                message: 'Contact not found'
            });

        }

        res.status(200).json({
            message: 'Contact deleted successfully',
            contact: deletedContact,
        });

    } catch (error) {

        if (error.name === 'CastError') {

            return res.status(400).json({
                message: 'Invalid contact id'
            });

        }

        res.status(500).json({
            message: 'Failed to delete contact',
            error: error.message
        });

    }

};

module.exports = {
    getContacts,
    createContact,
    deleteContact,
};

