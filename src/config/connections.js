const mongoose = require('mongoose');

const uri = "mongodb+srv://choudharydevendra428:gS3ZXjNh7OVH3v9P@cluster0.xy5wuyc.mongodb.net/buzz_chat?authSource=admin"; 


const db = () => {
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('Error:', err));
};

module.exports = db;


