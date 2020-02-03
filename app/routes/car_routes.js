const router = require('express').Router()
const Car = require('../models/car')


const passport =require('passport')
const requireToken = passport.authenticate('bearer',{session:false})


const customErrors = require('../../lib/custom_errors')
const requireOwnership = customErrors.requireOwnership;

// /////////////////////////////////
const index = (req, res, next) => {
    const userId =req.user._id
    Car.find({"owner":userId})
        .then(
            cars => res.status(200).json({
                cars: cars
            })
        )
        .catch(next)
}
router.get('/cars',requireToken, index)
// /////////////////////////////////

// ///////////////////////////////// 
const create = (req, res, next) => {
    const userId =req.user._id //
    const newCar = req.body.car
    newCar.owner=userId  //
    Car.create(newCar)
        .then(
            car => {
                res.status(201).json({
                    car: car
                })
            }
        )
        .catch(next)
}
router.post('/cars',requireToken, create)
// /////////////////////////////////

// /////////////////////////////////
const show = (req, res, next) => {
    const carid = req.params.carid
    Car.findById(carid)
        .then(
            car => {
                requireOwnership(req,car)
                res.status(200).json({
                car: car
            })
        }
        )
        .catch(next)
}
router.get('/cars/:carid',requireToken, show)
// /////////////////////////////////

// /////////////////////////////////
const update = (req, res, next) => {
    const carid = req.params.carid
    const updateCar = req.body.car
    Car.findById(carid)
        .then(
            car => {
                requireOwnership(req,car)
                 return car.update(updateCar)
            }
        )
        .then(()=>res.status(204))
        .catch(next)
}
router.patch('/cars/:carid',requireToken, update)
// /////////////////////////////////

// /////////////////////////////////
const destroy = (req, res, next) => {
    const carid = req.params.carid
    Car.findById(carid)
        .then(
            car => {
                requireOwnership(req,car)
                return car.remove()
            }
        )
        .then(()=>res.sendStatus(204))
        .catch(next)
}
router.delete('/cars/:carid',requireToken, destroy )
// /////////////////////////////////


module.exports = router