import jwt from 'jsonwebtoken';

const auth = (requiredRole = null) => {
    return (req, res, next) => {
        let token = null;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token.' });
            } 
            
            req.user = decoded;
                
            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            next();
        });
    }
}

const cookieAuth= (req, res, next)=>{
  try {
    const token = req.cookies.token


   if (!token) {
       return res.status(401).json({ message: "No token provided" });
     } 

     const decoded = jwt.verify(token,process.env.SECRET_KEY)

      req.user = decoded;

      

      next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default auth; 
export { cookieAuth };