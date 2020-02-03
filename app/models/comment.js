const mongoose =require('mongoose')


const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        maxlength:150,
        required:true
    },
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }


})


const Comment = mongoose.model('Comment',commentSchema)

module.exports=Comment