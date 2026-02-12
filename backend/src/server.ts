import express from "express";
import codeExecRouter from "./v1/routes/code.js";
const app = express();

app.use(express.json());
app.use("/v1/codeExec", codeExecRouter);

app.get("/", (req, res) => {
    res.send("Hello World!");
    });
    
const PORT = process.env.PORT || 3001;

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();