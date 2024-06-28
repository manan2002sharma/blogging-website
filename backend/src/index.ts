import { Hono } from 'hono'
import {bookRouter} from './routes/blog'
import {userRouter} from './routes/user'
import { sign, verify } from 'hono/jwt';
const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_KEY:string
  }
  Variables:{
    userid: string,
  }
}>();
// const prisma=new PrismaClient({
//   datasourceUrl:c.env.DATABASE_URL,
// }).$extends(withAccelerate())
// app.use('/api/v1/blog/*',async (c,next)=>{
//   const jwt = c.req.header('Authorization')
//   if(!jwt){
//     c.status(401); 
//     return c.json({error: 'Invalid user'});
//   }
//   const user= jwt.split(" ")[1];

//   const payload = await verify(user,c.env.JWT_KEY);
//   if(!payload){
//     c.status(401); 
//     return c.json({error: 'Invalid user'});
//   }
//   c.set('userid',payload.id)

//   await next()
// })


app.route('/api/v1/book',bookRouter);
app.route('/api/v1/user',userRouter);
export default app
