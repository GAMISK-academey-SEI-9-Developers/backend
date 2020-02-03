const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CarSchema = new Schema({
    model: {
        type: String,
        required: true
    },
    
    seets: {
        type: Number,
        required: true
    },
    year:{
        type:Number,
        min:2015,
        max: new Date().getFullYear() + 1
    },
    color: String,
    // plate:{
    //     number:{
    //         type:Number,
    //         min:1,
    //         max:9999
    //     },
    //     letters:{
    //         type:String,
            
     //     }
    // },
    owner:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
}, {
    timestamps: true
})


const Car = mongoose.model('Car', CarSchema)


module.exports = Car