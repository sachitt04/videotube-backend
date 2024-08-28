import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid id")
    }

    const video = await Video.findById(videoId)

    // now we have videoID now we need to check for 
    // checking if user had already liked the video
  const  existingLikeStatus = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(req.user?._id)    
  })
  if(existingLikeStatus){
    const dislike = await Like.findByIdAndDelete(req.user?._id)
    if(!dislike){
        throw new ApiError(500,"failed to dislike")
    }
  }else{
    const like = await Like.create({
        videoId: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
    })

    if(!like){
        throw new ApiError(500,"failed to like")
    }
  }

  const likesCount = await Video.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(videoId)
        }

    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"likesCount"
        }
    },
    {
        $addFields:{
            likesCountOnVideo:{
                $size:"$likesCount"
            }
        }
    },
    {
        $project:{
            likesCountOnVideo:1,
        
        }

    }
  ])

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        {
            existingLikeStatus : !existingLikeStatus,
            likesCount:likesCount[0]

        },
        
        "likes count fetched successfully"
    
 
    )
  )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"invalid commentId")
    }

    // now we have comment id 
    // checking for existinng like in comment
    const existingLikeStaus = await Like.findOne({
        Comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(req.user?._id)

    })

    if(existingLikeStaus){
        const dislike = await Like.findByIdAndDelete(commentId)
        if(!dislike){
            throw new ApiError(500,"error while disliking the comment")
        }

    
    } else{
        const like  = await Like.create({
            Comment: new mongoose.Types.ObjectId(commentId),
            likedBy : new mongoose.Types.ObjectId(req.user?._id)
        })

        if(!like){
            throw new ApiError(500,"error while liking the video")
        }
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                existingLikeStaus:!existingLikeStaus
            }
            

        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweetID")
    }
    // now we have tweet id
    //  checking for existing like in tweet by the user
    const existingLikeStatus = await Like.findOne({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy:new mongoose.Types.ObjectId(req.user?._id)
    })

    if(existingLikeStatus){
        
        const dislike = await Like.findByIdAndDelete(tweetId)
        
        if(!dislike){
            throw new ApiError(500,"error while dislikng the tweet")
        }
    } else{
        const like = await Like.create({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
        if(!like){
            throw new ApiError(500,"error while liking the tweet")
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {existingLikeStatus:!existingLikeStatus},
            "tweet liked successfully"
        )
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}