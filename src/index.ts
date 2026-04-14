import express, { urlencoded } from "express";
import authRouter from "./Routes/authRouter";
import updateRoutes from "./Routes/updateRouter";
import authMiddleware from "./Middleware/authMiddleware";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("server is connected");
});

app.use("/api/user", authRouter);
app.use("/api/user", authMiddleware, updateRoutes);

app.listen(PORT, () => {
  console.log(`Server is connected at http://localhost:${PORT}`);
});
