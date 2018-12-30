var mongoose = require("mongoose");

//Save reference to schema constructor
var Schema = mongoose.Schema;

//Create new UserSchema object
var NoteSchema = new Schema({
    body: {
        type: String,
        required: true,
        trim: true
    }
});

//Create model from the above schema
var Note = mongoose.model("Note", NoteSchema);

//Export the Questions model
module.exports = Note;