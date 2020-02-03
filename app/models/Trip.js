const mongoose = require('mongoose')
const User = require('./user')
const TripSchema = new mongoose.Schema({
    date:{type:Date} ,
    Destenation:{type:String,required:true},
    Depature:{type:String,required:true},
    abailable_seates:Number,
    owner:{type: mongoose.Schema.Types.ObjectId,
        ref: 'User'},
    Passengers:[{type: mongoose.Schema.Types.ObjectId,
        ref: 'User'}],

    waitingPassengers:[{type: mongoose.Schema.Types.ObjectId,
            ref: 'User'}],

    
})

TripSchema.pre("save",function(next){
    const currentdate = new Date
    let trip = this 
    User.findById(trip._doc.owner)
    .then(
        user => {
            console.log(trip._doc.date)
            
            console.log(user._doc.tripDate.some(date =>{date ===trip._doc.date}))
            if(!user._doc.tripDate.some(date =>{date ===trip._doc.date})){
            myarray=user._doc.tripDate.concat([trip._doc.date])
          
           return user.update({tripDate:myarray})    
        }
            else{
                throw new Error('pls cry')
            }
            
        }   
    )
    .catch(
        err => console.log(err)
    )
   next()               
})
   
const Trip=mongoose.model('Trip',TripSchema)

module.exports =Trip
