import * as fs from "fs";
import express, { Request, Response } from "express";
import * as path from "path";
const app = express();
const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, "./public/index.html");
app.use(express.static("public"));
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.get("/", (req: Request, res: Response) => res.sendFile(indexPath));

class User {
	constructor(
		public id: number,
		public fname: string,
		public mname: string,
		public lname: string,
		public email: string,
		public doj:string,
		public pno: string,
		public role: string,
		public address: string
	) {}
}

let userData: User[] = [];

const getFileData = () => {
	return new Promise<User[]>((resolve, reject) => {
		fs.readFile("./data.json", "utf8", (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err);
				reject(err);
				return;
			}
			const data = JSON.parse(jsonString);
			resolve(data);
		});
	});
};

const writeFileData = (data: Object) => {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile("./data.json", JSON.stringify(data), (err) => {
			if (err) {
				console.log(err);
				reject();
			} else {
				console.log("File written successfully\n");
				resolve();
			}
		});
	});
};

app.get("/refreshData", async (req: Request, res: Response) => {
	const fs = require("fs");
	const data: User[] = await getFileData();
	userData = data;
	res.send(data);
});

app.delete("/deleteRow", async (req: Request, res: Response) => {
	const fs = require("fs");
	let updatedData: User[] = [];
	if (req.headers.id)
		for (let index = 0; index < userData.length; index++) {
			const i = userData[index];
			if (i.id != +req.headers.id) {
				updatedData.push(i);
			}
		}
	await writeFileData(updatedData);
	res.send("success");
});

app.post("/editRow", (req: Request, res: Response) => {
	const fs = require("fs");
	let updatedData = [];
	let isSuccess = false;
	let givenData = req.body;
	for (let index = 0; index < userData.length; index++) {
		const i = userData[index];
		if (i.id == givenData.id) {
			userData[index].fname = givenData.fname;
			userData[index].mname = givenData.mname;
			userData[index].lname = givenData.lname;
			userData[index].email = givenData.email;
			userData[index].doj = givenData.doj;
			userData[index].pno = givenData.pno;
			userData[index].role = givenData.role;
			userData[index].address = givenData.address;
			isSuccess = true;
			res.send("success!");
		}
	}

	if (isSuccess) {
		fs.writeFile("./data.json", JSON.stringify(userData), (err: Error) => {
			if (err) console.log(err);
			else {
				console.log("File written successfully\n");
				// console.log("The written has the following contents:");
				// console.log(fs.readFileSync("./data.json", "utf8"));
			}
		});
	}
});

app.post("/addData", async (req: Request, res: Response) => {
	let maxId: number = 1;
	const data: User[] = await getFileData();
	userData = data;
	for (let i = 0; i < userData.length; i++)
		if (+userData[i].id >= maxId) maxId += 1;
	const newData = {
		id: maxId,
		fname: req.body.fname,
		mname: req.body.mname,
		lname: req.body.lname,
		email: req.body.email,
		doj:req.body.doj,
		pno: req.body.phoneNumber,
		role: req.body.role,
		address: req.body.address,
	};
	userData.push(newData);
	await writeFileData(userData);
	res.send("success");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
