import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt';
import {  createBlogInput, updateBlogInput } from "@lithane/manan-medium"

export const bookRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_KEY:string
  }
  Variables:{
    userid: string,
  }
}>();


bookRouter.use("/*",async (c,next)=>{
    const auth=c.req.header("Authorization") || "";
    const user= await verify(auth,c.env.JWT_KEY);
    console.log("afd")
    if(user){
        console.log(user)
        c.set("userid",user.id);
        await next();
    }else{
        c.status(403);
        return c.json({
            "message":"login please"
        })
    }
})

bookRouter.put("/update" , async (c)=>{
    
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const userid=c.get("userid");
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const post = await prisma.post.update({
        where:{
            id:body.id,
            authorId:userid,
        },
        data : {
            title : body.title,
            content : body.content,
        }
    })

    return c.json({post});
})

bookRouter.post("/",async (c)=>{

    
    const userid=c.get("userid");
    const prisma=new PrismaClient({
        datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const post = await prisma.post.create({
        data:{
            title : body.title,
            content : body.content,
            authorId : userid
        }
    })

    return c.json({id:post.id});
})



bookRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const posts = await prisma.post.findMany();

	return c.json(posts);
})

bookRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})

