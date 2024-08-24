import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {v2 as cloudinary} from "cloudinary"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((fld)=> fld.trim()==="")){
        throw new ApiError(400,"title and description are required")
    }
     let videoFileLocalPath 
     if(req.files && Array.isArray(req.files?.videoFile) && req.files?.videoFile.length > 0){
        videoFileLocalPath = req.files?.videoFile[0].path

     }
     if(!videoFileLocalPath){
        throw new ApiError("video file is required")
     }

     let thumbnailLocalPath 
     if(req.files && Array.isArray(req.files?.thumbnail)&& req.files?.thumbnail.length > 0){
        thumbnailLocalPath = req.files?.thumbnail[0].path
     }

     if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file is required")
     }

     // now uploading things on cloudinry
     const videoFile = await uploadOnCloudinary(videoFileLocalPath)
     const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)

     const video = await Video.create({
        title,
        description,
        videoFile : videoFile.url,
        videoFilePublicId : videoFile.public_id,
        thumbnail : thumbnailFile.url,
        thumbnailPublicId : thumbnail.public_id,
        duration : videoFile.duration,
        isPublished : true,
        owner: new mongoose.Types.ObjectId(req.user?._id)
 })

 if(!video) throw new ApiError(500,"error while uploading the video")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video Uploaded successfully"
        )
    )
 
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   const video =  await Video.findById(videoId)
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body
    if(!title || !description){
        throw new ApiError(400,"title and description are required")
    }
    // thumbnail changes
    let newThumbnailLocalPath
    if(req.files && Array.isArray(req.files.thumbnail) && req.files?.thumbnail.length > 0){
        newThumbnailLocalPath = req.files?.thumbnail[0].path

    }
    if(video.thumbnailPublicId){
        await cloudinary.uploader.destroy(video.thumbnailPublicId)

    }
  const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath)

  await video.findByIdAndUpdate(videoId,{
    title,
    description,
    thumbnail : newThumbnail.url,
    thumbnailPublicId :newThumbnail.public_id
  })

  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        video,
        "video updated successfully"
    )
  )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)

    // deleting video from cloudinary
    if(video.videoFilePublicId){
        await cloudinary.uploader.destroy(video.videoFilePublicId)
    }

    await video.findbyIdandDelete(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
