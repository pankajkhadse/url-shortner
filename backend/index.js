require('dotenv').config();
const express = require('express')
const {connectDB} = require('./DBconnect')
const Url = require('./models/url')
const cookieParser = require('cookie-parser')
const {restrictToLoggedinUserOnly} =  require('./middlewares/auth')
const cors = require("cors");

const UrlRoute = require('./routes/url')

const userRoute = require('./routes/user')

const app = express();
const PORT = process.env.PORT || 8001


// ✅ FIX: Correct CORS configuration
app.use(cors({
  origin: 'https://url-shortner-ai.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Manual header override to ensure correct origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://url-shortner-ai.netlify.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
connectDB(process.env.MONGODB_URI)

app.use("/url",restrictToLoggedinUserOnly,UrlRoute)
app.use("/user",userRoute) 
// checkAuth
// app.use('/',staticRote)

app.get('/:id', async(req,res)=>{
const id =req.params.id;
const entry = await Url.findOneAndUpdate({shortID:id},{
    $push:{
        visitHistory:{timestamp:Date.now()},
    }
})
if(!entry){
    return res.status(404).json({ error: 'Invalid URL' });}
res.redirect(entry.redirectURL)
// console.log("entry",entry)
})




app.listen(PORT,()=>{console.log(`Server running on port:${PORT}`)})
