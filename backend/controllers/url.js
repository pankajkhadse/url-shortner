const ids = require('short-id');
const Url = require('../models/url')
require('dotenv').config();


async function handleGenerateShortID(req, res) {
    const body = req.body; 
    
    if(!body.url) {
        return res.status(400).json({URL:"URL is required"})
    }

    try {
        const shortID = ids.generate()

        await Url.create({
           shortID: shortID,
           redirectURL: body.url,
           visitHistory: [],
           createdBy: req.user._id,
        });

        // ✅ Smart Base URL detection
        const getBaseUrl = () => {
            // 1. Use environment variable first (for production)
            if (process.env.API_BASE_URL) {
                return process.env.API_BASE_URL;
            }
            
            // 2. Use request-based URL (for production without env var)
            if (req.get('host')) {
                const protocol = req.secure ? 'https' : 'http';
                return `${protocol}://${req.get('host')}`;
            }
            
            // 3. Fallback for development
            return 'http://localhost:8001';
        };

        const API_BASE_URL = getBaseUrl();
        
        res.json({
            shortUrl: `${API_BASE_URL}/${shortID}`,
            id: shortID
        });

    } catch (error) {
        console.error("Error creating short URL:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

async function handleAnaytics(req, res){
  const shortID =  req.params.shortId;

  const result = await Url.findOne({shortID})
  
  return res.json({
    totalClicks:result.visitHistory.length,
    analytics:result.visitHistory
})

}

module.exports={
    handleGenerateShortID,
    handleAnaytics
}