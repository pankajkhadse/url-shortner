const {handleGenerateShortID,handleAnaytics} = require('../controllers/url') 
const express  =  require('express')
const Url = require('../models/url')

const router = express.Router()

router.post('/',handleGenerateShortID)
router.get('/analytics/:shortId',handleAnaytics)
router.get("/userUrl/urls", async (req, res) => {
  try {
    const allUrls = await Url.find({ createdBy: req.user._id });

    if (allUrls.length === 0) {
      return res.json({ message: "No URLs found for this user" });
    }

    res.json({ urls: allUrls });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Add to your url.js routes
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUrl = await Url.findOneAndDelete({ 
      shortID: id, 
      createdBy: req.user._id 
    });
    
    if (!deletedUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router