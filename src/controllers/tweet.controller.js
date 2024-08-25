import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetContent} = req.body
    if(!tweetContent){
        throw new ApiError(400,"tweet should be written empty tweet!")
    }
    const tweet = await Tweet.create({
        content: tweetContent,
        owner: new mongoose.Types.ObjectId(req.user?._id)

    })

    if(!tweet){
        throw new ApiError(500,"failed to create tweet try again")
    }

    return res
    .staus(200)
    .json(
        new ApiResponse(200,
            tweet,
            "tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
//TODO: update tweet
    const {tweetId} = req.params
    if(!tweetId) throw new ApiError(400,"didnt get the tweetIt")

        const tweet = await Tweet.findById(tweetId)
        if(req.user?._id.toString()!==tweet.owner._id){
            throw new ApiError(404,"unauthorized request")
        }

    const {newContent} = req.body
    if(!newContent) throw new ApiError(400,"content is required")
    
        await tweet.findByIdAndUpdate(tweetId,{
            content:newContent

        })

        return res
        .staus(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet updated successfull"
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
