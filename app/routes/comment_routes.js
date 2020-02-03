const router = require('express').Router()
const Comment = require('../models/comment')


const passport =require('passport')
const requireToken = passport.authenticate('bearer',{session:false})


const customErrors = require('../../lib/custom_errors')
const requireOwnership = customErrors.requireOwnership;

// /////////////////////////////////
const index = (req, res, next) => {
    const userId =req.user._id
    Comment.find({"to":userId})
        .then(
            comments => res.status(200).json({
                comments: comments
            })
        )
        .catch(next)
}
router.get('/comments',requireToken, index)
// /////////////////////////////////

// ///////////////////////////////// 
const create = (req, res, next) => {
    const userId =req.user._id //
    const newComment = req.body.Comment
    newComment.owner=userId  //
    Comment.create(newComment)
        .then(
            comment => {
                res.status(201).json({
                    comment: comment
                })
            }
        )
        .catch(next)
}
router.post('/comments',requireToken, create)
// /////////////////////////////////

// /////////////////////////////////
const show = (req, res, next) => {
    const commentid = req.params.commentid
    Comment.findById(commentid)
        .then(
            comment => {
                requireOwnership(req,comment)
                res.status(200).json({
                    comment: comment
            })
        }
        )
        .catch(next)
}
router.get('/comments/:commentid',requireToken, show)
// /////////////////////////////////

// /////////////////////////////////
const update = (req, res, next) => {
    const commentid = req.params.commentid
    const updateComment = req.body.comment
    Comment.findById(commentid)
        .then(
            comment => {
                requireOwnership(req,comment)
                 return comment.update(updateComment)
            }
        )
        .then(()=>res.status(204))
        .catch(next)
}
router.patch('/comments/:commentid',requireToken, update)
// /////////////////////////////////

// /////////////////////////////////
const destroy = (req, res, next) => {
    const commentid = req.params.commentid
    Comment.findById(commentid)
        .then(
            comment => {
                requireOwnership(req,comment)
                return comment.remove()
            }
        )
        .then(()=>res.sendStatus(204))
        .catch(next)
}
router.delete('/comments/:commentid',requireToken, destroy )
// /////////////////////////////////


module.exports = router