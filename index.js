import express from 'express';
import router_api_v1 from './routes/api_v1.js';
import path from 'path';
import cookieParser from 'cookie-parser';
const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());


app.use('/api/v1', router_api_v1);

app.get('/', (req, res) => {
    res.sendFile(path.join('./', 'public', 'bolt.html'));
});


try {
 app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
} catch (error) {
   console.log("Server not listing ❗", error)
}