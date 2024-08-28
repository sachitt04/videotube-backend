import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

    // check for already subscribed or not
    const existingSubscriptionStatus = await Subscription.findOne({
        subscriber:req.user?._id,
        channelId: channelId
    })

    if(existingSubscriptionStatus){
        // if subscribed then we have to remove subscribe

        const unsubscribe = await Subscription.findByIdAndDelete(existingSubscriptionStatus);
        if(!unsubscribe){
            throw new ApiError(500,"error while unsubscribing")
        }
    } else{
        // if not subscribed then add subscription
        const subscribe = await Subscription.create({
            subscriber: req.user?._id,
            channel :channelId
    })

    if(!subscribe){
        throw new ApiError(500,"error while subscribing")
     }
    }

    // displying the subscribers count
    const subscribers = await Subscription.find({
        channel:channelId,
    }).countDocuments()
    console.log(subscribers)    

    return res
    .staus(200)
    .json(
        new ApiResponse(
            200,
            {

            subscribers:subscribers,
            isSubscribed:!existingSubscriptionStatus
            // subscription toggled
            }
        )
    )
})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

  const subscribers =  await Subscription.aggregate([
        {
            $match:{
                channel:mongoose.Types.ObjectId(channelId)
            }
        },
        // now lookup 
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribers"
            }
        },
        {
            $addFields:{
                subscirbersCount:{
                    $size:"$subscribers"
                }
            }
        },
        {
            $project:{
                subscirbersCount:1
            }
        }
    ])

    return res
    .staus(200)
    .json(
        new ApiResponse(
            200,
            subscribers[0],
            "subscribers count fetched successfully"
            
        )
    )


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}