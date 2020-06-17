var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var convoSchema = new Schema(
    {
        pain : Number,
    }
);

module.exports = mongoose.model('Conversation',convoSchema);