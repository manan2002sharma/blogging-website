import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
import {signupInput,signinInput} from '@lithane/manan-medium'
export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_KEY:string
  }
  Variables:{
    userid: string,
  }
}>();


userRouter.post('/signup', async (c) => {
  
const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
}).$extends(withAccelerate())


    const user  =await prisma.user.create({
    data:{
        email:body.email,
        password:body.password,
        name:body.name,
    }
    });
    console.log(user.id);
    const jwt= await sign({id : user.id},c.env.JWT_KEY);
    return c.json({
        jwt
      })



})

userRouter.post('/signin',async(c) => {
  const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
}).$extends(withAccelerate())


const user=await prisma.user.findUnique({
    where:{
    email:body.email,
    password: body.password
    }
});
if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_KEY);
    return c.json({ jwt });

})