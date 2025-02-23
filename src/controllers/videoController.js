import Video from "../models/Video"
import User from "../models/User"
import Comment from "../models/Comment"

export const trending = async(req,res)=> {
	const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
	return res.render("home", {pageTitle:"Home", videos});
};

export const watch = async(req,res) => {
    const {id}= req.params;
	const video = await Video.findById(id).populate("owner").populate("comments");
    const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
    if(video===null) {
        return res.status(404).render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("watch",{pageTitle:`Watching : ${video.title}`, video, videos});
};

export const getEdit =async(req,res) => {
    const {id}= req.params;
    const {loggedInUser : {_id}}= req.session;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    return res.render("edit",{pageTitle:`Editing : ${video.title}`, video});
};

export const postEdit = async(req,res) => {
    const {id}= req.params;
    const {loggedInUser : {_id}}= req.session;
    const {title, description, hashtags} = req.body;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    try { 
        await Video.findByIdAndUpdate(id, {title, description, hashtags:Video.hashtagFormatting(hashtags)})
        return res.redirect("/");            
    } catch(error) {  
     return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message,})
    }
};

export const getUpload = (req, res) => {
    return res.render("upload",{pageTitle: "Upload Video"})
}; 
export const postUpload = async (req, res) => {
    const { session: {loggedInUser: {_id} }, files: {video, thumb}, body: {title, description, hashtags}} = req;
    try{
        const newVideo = await Video.create({
            title,
            description,
            hashtags: Video.hashtagFormatting(hashtags),
            fileUrl: video[0].location,
            thumbUrl: thumb[0].location,
            owner: _id
        });
        const user = await User.findById(_id);
        await user.videos.push(newVideo._id);
        await user.save();
        return res.redirect("/");
    } catch(error) {  
        return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message,})
    }
}

export const deleteVideo = async(req,res) => {
    const {id}=req.params;
    const {loggedInUser : {_id}}= req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async(req,res) => {
    const {keyword}=req.query;
    console.log("keyword",keyword);
    let videos = [];
    if(keyword) {
        videos = await Video.find({title: {$regex: new RegExp(keyword,"i")}}).populate("owner");
	 }
     console.log("videos",videos)
    res.render("search",{pageTitle:"Search Video", videos});
} 

export const registerView = async(req,res) => {
	const {id} = req.params;
	const video = await Video.findById(id);
	if(!video) {
		return res.status(404);	
	}
	video.meta.views = video.meta.views +1 ;
	await video.save();
    return res.sendStatus(200);
}
export const createComment = async (req, res) => {
    const {
      session: { loggedInUser },
      body: { text },
      params: { id },
    } = req;
    console.log("user,text,id",loggedInUser,text,id);
    const video = await Video.findById(id);
    if (!video) {
      return res.sendStatus(404);
    }
    const comment = await Comment.create({
      text,
      owner: loggedInUser._id,
      video: id,
    });
    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({ newCommentId: comment._id });
  };


  export const deleteComment = async (req, res) => {
    const { commentId, videoId } = req.body; // comment id, video id
    const { _id } = req.session.loggedInUser; // user id
    const { owner } = await Comment.findById(id);
    const video = await Video.findById(videoId);
    console.log(commentId, videoId, _id, owner, video)
    if (String(owner) !== _id) return res.sendStatus(404);
    else {
      await Comment.findByIdAndDelete(id);
      video.comments.splice(video.comments.indexOf(videoId), 1);
      video.save();
      return res.sendStatus(201);
    }
  };