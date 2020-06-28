var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var convoSchema = new Schema(
    {
        Room : Number,
        Users : Number,
    }
);

module.exports = mongoose.model('Conversation',convoSchema);