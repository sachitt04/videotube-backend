import mongoose, { isValidObjectId, mongo } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {comment} = req.body
    const {videoId} = req.params
    if(!comment){
        throw new ApiError(400,"comment not found")
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid VideoId")
    }
    const video = await Video.findById(videoId)
    const addComment = await Comment.create({
        comment:comment,
        video: new mongoose.Types.ObjectId(videoId),
        owner:new mongoose.Types.ObjectId(req.user?._id)
    })
    if(!addComment){
        throw new ApiError(500,"error while adding the comment")
    }

    return res
    .status(200)


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {newComment} = req.body
    if(!newComment){
        throw new ApiError(400,"new comment not found")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
