import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo"
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";


const app = express();
const logger = morgan("dev");
app.use(logger);

app.set("view engine","pug");
app.set("views",process.cwd()+"/src/views");
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.COOKIE_SECRET, 
     resave:false, 
     saveUninitialized:false,
     store: MongoStore.create({mongoUrl: process.env.DB_URL})
    }))
     ;

app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"))
app.use("/static", express.static("assets"))
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);


export default app;
