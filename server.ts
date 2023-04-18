import  * as fs from "fs";
import * as express from "express";
import  {Request,Response} from "express";
import * as path from "path";
const app=express();
const port=process.env.PORT||3000;
const index=path.join(__dirname,"./public/index.html");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
    extended:true,
}));
app.get("/",(request:Request,response:Response)=>response.sendFile(index));

class User{
    constructor(
        public id:number,
        public fname:string,
        public mname:string,
        public lname:string,
        public email:string,
        public phoneno:string,
        public role:string,
        public address:string
    ){}
}

let userData:User[]=[];

const getFileData=()=>{
    return new Promise<User[]>((resolve,reject)=>{
        fs.readFile("./data.json","utf-8",(err,jsonString)=>{
            if(err){
                console.log("File read failed: ",err);
                reject(err);
                return;
            }
            const data=JSON.parse(jsonString);
            resolve(data); 
        });
    });
};

const writefileData=(data:Object)=>{
    return new Promise<void>((resolve,reject)=>{
        fs.writeFile("./data.json",JSON.stringify(data),(err)=>{
            if(err){
                console.log(err);
                reject();
            }
            else{
                console.log("File written is successfull");
                resolve();
            }
        });
    });
};

app.get("/refreshData",async(request:Request,response:Response)=>{
    const fs=require("fs");
    const data:User[]=await getFileData();
    userData=data;
    express.response.send(data);
});

app.delete("/deleteRow",async(request:Request,response:Response)=>{
    const fs=require("fs");
    let updatedData:User[]=[];
    if(request.headers.id)
    for (let i = 0; i < userData.length; i++) {
        const elem = userData[i];
        if(elem.id!-+request.headers.id){
            updatedData.push(elem);
        }
    }
    await writefileData(updatedData);
    response.send("success");
});

app.post("/editRow",(request:Request,response:Response)=>{
    const fs=require("fs");
    let updatedData=[];
    let isSuccess=false;
    let givenData=request.body;
    for (let i = 0; i < userData.length; i++) {
        const elem = userData[i];
        if(elem.id==givenData.id){
            userData[i].fname=givenData.fname;
            userData[i].mname=givenData.mname;
            userData[i].lname=givenData.lname;
            userData[i].email=givenData.email;
            userData[i].phoneno=givenData.phoneno;
            userData[i].role=givenData.role;
            userData[i].address=givenData.address;
            isSuccess=true;
            response.send("success");
        }
    }
    if(isSuccess){
        fs.writeFile("./data.json",JSON.stringify(userData),(err:Error)=>{
            if(err){console.log(err);}
            else{
                console.log("File written is successfull");
            }
        });
    }
});

app.post("/addData",async(request:Request,response:Response)=>{
    let maxId:number=1;
    const data:User[]=await getFileData();
    userData=data;
    for (let i = 0; i < userData.length; i++) 
        if(+userData[i].id>=maxId)maxId+=1;
    const newData={
        id:maxId,
        fname:request.body.fname,
        mname:request.body.mname,
        lname:request.body.lname,
        email:request.body.email,
        phoneno:request.body.phoneno,
        role:request.body.role,
        address:request.body.address,
    };
    userData.push(newData);
    await writefileData(userData);
    response.send("success");
});

app.listen(port,()=>console.log(`Server started at port:${port}!`));