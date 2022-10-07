
import { password } from "../configs/index.js";

export default function checkAuthentication(req, res, next){
   if(req.session.password === password){
      next()
   } else {
      return res.status(401).json({'message': 'You need authentication'})
   }
 }