import express from 'express';
import bodyParser from 'body-parser';
import { identifyHandler } from './controller/index';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/",async(req,res)=>{
    res.json("server running fine")
});

app.post('/identify', identifyHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
