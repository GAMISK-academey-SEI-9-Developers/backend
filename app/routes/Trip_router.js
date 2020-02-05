// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Trip = require('../models/Trip')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership
const mongoose =require('mongoose')
// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /examples
router.get('/trips', requireToken, (req, res, next) => {
  
  // Option 1 get user's examples
  Trip.find({})
    .then(trips => res.status(200).json({trips: trips}))
    .catch(next)
  
  // // Option 2 get user's examples
  // // must import User model and User model must have virtual for examples
  // User.findById(req.user.id) 
    // .populate('examples')
    // .then(user => res.status(200).json({ examples: user.examples }))
    // .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/trips/:id', requireToken, (req, res, next) => {
  
  // req.params.id will be set based on the `:id` in the route
  Trip.findById(req.params.id)
    .populate("Passengers")
    .populate("waitingPassengers")
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(trip => {
     
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
     
    
      res.status(200).json({ trip })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/trips', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  const newTrip = req.body.trip
  newTrip.owner = req.user._id

  Trip.create(newTrip)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(trip => {
      res.status(201).json({ trip})
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/trips/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  Trip.findById(req.params.id)
    .then(handle404)
    .then(trip => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, trip)
      // pass the result of Mongoose's `.update` to the next `.then`
      return trip.update(req.body.trip)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/trips/:id', requireToken, (req, res, next) => {
  Trip.findById(req.params.id)
    .then(handle404)
    .then(trip => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, trip)
      // delete the example ONLY IF the above didn't throw
     return trip.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})


router.patch('/trips/:id/:user', requireToken, (req, res, next) => {
    Trip.findById(req.params.id)
      .then(handle404)
      .then(trip => {
          if(trip.Passengers.includes(req.user._id)){
             trip.Passengers.slice(indexOf(req.user._id))
             return trip.update()
          }
      })
      // send back 204 and no content if the deletion succeeded
      .then(() => res.sendStatus(204))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

router.put('/trips/:id/passengers', requireToken, (req, res, next) => {
    // req.params.id will be set based on the `:id` in the route
    Trip.findById(req.params.id)
      .then(handle404)
      // if `findById` is succesful, respond with 200 and "example" JSON
      .then(trip => {
        requireOwnership(req, trip)
          let newArray =trip._doc.waitingPassengers.filter(id=>{
          String(id)!= req.body.id})
        
       let passengers =  trip._doc.Passengers.concat(req.body.id)
        
         trip.update({Passengers:passengers,waitingPassengers:newArray})
        .then(updated=>{console.log('hell yah')})
        res.status(200).json({trip})
      })
      // if an error occurs, pass it to the handler
      .catch(next)
  })


  router.delete('/trips/:id/passengers', requireToken, (req, res, next) => {
    // req.params.id will be set based on the `:id` in the route
    Trip.findById(req.params.id)
      .then(handle404)
      // if `findById` is succesful, respond with 200 and "example" JSON
      .then(trip => {
        requireOwnership(req, trip)
      let newArray =trip._doc.Passengers.filter(id=>{
          String(id)!=req.body.id})
        console.log(newArray)

         trip.update({Passengers:newArray,abailable_seates:trip._doc.abailable_seates-1})
        .then(updated=>{console.log('hell yah')})
        res.status(200).json({trip})
      })
      // if an error occurs, pass it to the handler
      .catch(next)
  })

  router.put('/trips/:id/WaitingPassengers', requireToken, (req, res, next) => {
    console.log('helloe')
    // req.params.id will be set based on the `:id` in the route
    Trip.findById(req.params.id)
      // if `findById` is succesful, respond with 200 and "example" JSON
      .then(trip => {
        // pass the `req` object and the Mongoose record to `requireOwnership`
        // it will throw an error if the current user isn't the owner
        if(!trip._doc.waitingPassengers.some(id=>{return String(id)==(req.body.user._id)})){
          if(!trip._doc.Passengers.some(id =>{return String(id) ==req.body.user._id})){
          if(String(trip._doc.owner)!=req.user._id){
            if(!req.body.user.tripDate.some(date=> trip._doc.date==date)){
              if(trip._doc.abailable_seates!=0){
        Trip.update({
          _id:req.params.id
        },{
          $push: { waitingPassengers: req.body.user._id}
        })
        
        .then(() => res.sendStatus(204))
            }else{res.status(400).json({error:'no availabe seats'})}}
        else{res.status(400).json({error:'you have another trip at the same time pleas check your trips'})}
      }
        else{res.status(400).json({error:'you are the Driver you cannot be a passenger of the same trip'})}
      }
        else{res.status(400).json({error:'you are conformed passenger on this trip!'})}
      }
        else{res.status(400).json({error:'you are aleady on the waitng list'})}

        res.status(200).json({trip})
        })
      
      .catch(next)
  })

module.exports = router