const jwt = require('jsonwebtoken');

const protect = (req,res,next) => {
    try {
if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
            return res.status(401).json({ message: "Unauthorized access, token is missing" });
        }

       const token = req.headers.authorization.split(" ")[1];
       if(!token) {
        return res.status(401).json({message:"Unathorised access token is missing"});

       }

       let decodedData;

       decodedData = jwt.verify(token,process.env.JWT_SECRET);
       req.user = { id: decodedData.id};

       next();
       
    } catch (error) {
        console.error("Error in protect middleware:", error);
        res.status(401).json({message:"Unauthorised access, invalid token", error:error.message})
    }
}

module.exports = protect;