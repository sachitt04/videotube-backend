import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name){
        throw new ApiError(400,"name and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"failed to create playlist try again")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist created successfully"
        )
    )
   //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId || ! isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId")
    }
    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    if(!playlist){
        throw new ApiError(400,"user have no playlists")
    }
     return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist[0],
        "playlist fetched successfully"

    
    ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(500,"error while finding playlist try again")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "finded playlist successfully"

        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId||!isValidObjectId(playlistId)||!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid playlistId or videoId")
    }
    const video = await Video.findById(videoId)
    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner._id.toString() !== req.user._id){
        throw new ApiError(404,"unauthorized request")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError("video is already included in playlist")
    }
    await playlist.videos.push(videoId)
    await playlist.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "successfully added video to playlist"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }

    const playlist = await Playlist.findById(playlistId)
    const video = await Video.findById(videoId)

    if(playlist.owner._id.toString() !== req.user._id){
        throw new ApiError(404,"unauthorized request")
    }

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"this video is not in playlist")

    }
    await playlist.videos.delete(videoId)
    await playlist.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video deleted successfully from playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
    const playlist = await Playlist.findById(playlistId)

    if(req.user._id.toString() !== playlist.owner._id){
        throw new ApiError(404,"unauthorized requst")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "plalist deleted successfully"
        )
    )
 
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistId")
    }
    if(!name){
        throw new ApiError(400,"cant get any updated name")
    }
    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner_id.toString() !== req.user._id.toString()){
        throw new ApiError(404,"unatuhorized request")
    }

 const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist,{
        name,
        description:description || ""
    },
    {
        new:true

    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        updatePlaylist,
        "playlist updated successfully"
        
    ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
