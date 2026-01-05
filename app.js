import express from "express";
import { connect_db } from "./models/index.js";
import cors from "cors";

import newsRoutes from "./routes/newsRoutes.js";

const app = express();
connect_db();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/news", newsRoutes);

export default app;