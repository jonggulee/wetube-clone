import express from "express";
import {logout, getEdit, postEdit, remove, getChangePassword, postChangePassword, getProfile, startGithubLogin, finishGithubLogin} from "../controllers/userController"
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout",protectorMiddleware, logout);
userRouter.route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/remove", remove);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/:id",getProfile);
userRouter.get("/github/start",publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);



export default userRouter ; 

