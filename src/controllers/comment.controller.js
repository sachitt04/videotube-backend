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
    const {commentId} = req.params
    const {newComment} = req.body

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"invalid commentId")
    }
    
    if(!newComment){
        throw new ApiError(400,"new comment not found")
    }

    // now cheking for if current user is the owner of the comment or not
    const comment = await Comment.findById(commentId)
    if(req.user?._id !== comment.owner._id){
        throw new ApiError(404,"unathorized request")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        comment:newComment
    },
{
    new:true
})

return res
.status(200)
.json(
    new ApiResponse(
        200,
        {updatedComment},
        "comment updated successfully"
    )
)


    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"invalid commentId")
    }

    const comment = await Comment.findById(commentId)
    if(req.user?._id !== comment.owner._id){
        throw  new ApiError(404,"unauthorized request")
    }

    await Comment.findByIdAndDelete(commentId)

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "comment deleted successfully"
        )
    )



})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
