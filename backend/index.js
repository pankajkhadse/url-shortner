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

 // ✅ Smart CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL // This will be your production frontend URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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