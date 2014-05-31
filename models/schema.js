var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
  emailid : String,
  username : String,
  sessionid :   String,
  chat: [{ activeuserscount : Number, message: String, activeusers: {emailid : String} }],
  date: { type: Date, default: Date.now },
  meetingurl : String,
  classroomname : String,
   time:
     {
    starttime: Date,
    endtime:  Date
  }
});

mongoose.model('chat', chatSchema);


module.exports = chatSchema;