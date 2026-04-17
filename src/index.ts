import express, { urlencoded } from "express";

// milldewares
import authMiddleware from "./Middleware/authMiddleware";

// routers
import authRouter from "./Routes/authRouter";
import updateRoutes from "./Routes/updateRouter";
import profileRoute from "./Routes/profileRouter.ts";

// configs
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// home indegater
app.get("/", (req, res) => {
  res.send("server is connected");
});

// for login and register
app.use("/api/user", authRouter);

// for changing importent tasks like password email of phoneNo
app.use("/api/user", authMiddleware, updateRoutes);

// profile create get update
app.use("/api/user", authMiddleware, profileRoute);

app.listen(PORT, () => {
  console.log(`Server is connected at http://localhost:${PORT}`);
});
