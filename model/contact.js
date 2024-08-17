const mongoose = require('mongoose');
const { Schema } = mongoose;
const contactSchema = new Schema({
    nama: {
        type: String,
        required: true,
    },
    notelp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    }
})

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;