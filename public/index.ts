import { data } from "jquery";
import moment from "moment"; 
class User<T=string,U=number> {
	constructor(
		public id: U,
		public fname: T,
		public mname: T,
		public lname: T,
		public email: T,
		public doj:T,
		public pno: T,
		public role: Role | T,
		public address: T
	) {}
}

enum Role {
	SuperAdmin = "SuperAdmin",
	Admin = "Admin",
	Subscriber = "Subscriber",
}

// const dateformat=(datevalue:string)=>{
// 	const[year,month,day]=datevalue.split('-');
// 	const date=new Date(+year,+month-1,+day);
// 	return date;
// }


interface roleObject {
	superAdmin: HTMLInputElement,
	admin: HTMLInputElement,
	subscriber: HTMLInputElement,
}

function dateTimeFormatter(target:any,key:string,descriptor:PropertyDescriptor){
	const originalMethod=descriptor.value;
	descriptor.value=function(...args:any[]){
		const result=originalMethod.apply(this,args);
		if(result instanceof Date){
			const formattedDate = result.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
			// .replace(/T/,' ')
			// .replace(/\..+/,'')
			;
			const element=document.getElementById('DateShow');
			if(element){
				element.innerHTML=formattedDate;
			}
			return formattedDate;
		}else{
			return result;
		}
	}
	return descriptor;
}
class example{
	@dateTimeFormatter
	getcurrentDate():Date{
		return new Date();
	}
}

const Example=new example();
console.log(Example.getcurrentDate());



const getData = () => {
	$.ajax({
		url: "http://localhost:3000/refreshData",
		success: function (result) {
			fillTable(JSON.stringify(result));
		},
	});
};

let editRowElement: string[];

const fillTable = <T extends string>(data:T) => {
	const users: User[] = JSON.parse(data);
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const id = user.id;
		document.getElementById("tableBody")!.innerHTML += `<tr id="row${id}">
            <td><div class="row${id}">${user.fname}</div></td>
            <td><div class="row${id}">${user.mname}</div></td>
            <td><div class="row${id}">${user.lname}</div></td>
            <td><div class="row${id}">${user.email}</div></td>
			<td><div class="row${id}">${user.doj}</div></td>
            <td><div class="row${id}">${user.pno}</div></td>
            <td><div class="row${id}">${user.role}</div></td>
            <td><div class="row${id}">${user.address}</div></td>
            <td><button id="editRow${id}" type="button" onclick="editRow(${id})" class="btn btn-success">Edit</button></td>
            <td><button id="deleteRow${id}" type="button" onclick="deleteData(${id})" class="btn btn-danger delete${id}">Delete</button></td>
        </tr>`;
	}
};

const editRow =<T extends string|number> (rowID: T) => {
	const row = document.getElementsByClassName(
		"row" + rowID
	) as unknown as HTMLElement[];
	editRowElement = [];
	for (let i = 0; i < row.length; i++) {
		row[i].contentEditable = "true";
		editRowElement.push(row[i].innerHTML);
	}

	const editButton = document.getElementById("editRow" + rowID);
	if (editButton) {
		editButton.innerHTML = "Save";
		editButton.setAttribute("onclick", "saveRow(" + rowID + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + rowID);
	if (deleteButton) {
		deleteButton.innerHTML = "Cancel";
		deleteButton.setAttribute("onclick", "cancelRowEdit(" + rowID + ")");
	}
};

const cancelRowEdit =<T extends string|number> (id: T) => {
	let row = document.getElementsByClassName(
		"row" + id
	) as unknown as HTMLElement[];
	for (let i = 0; i < 7; i++) {
		row[i].innerHTML = editRowElement[i];
		row[i].contentEditable = "false";
	}

	const editButton = document.getElementById("editRow" + id);
	if (editButton) {
		editButton.innerHTML = "Edit";
		editButton.setAttribute("onclick", "editRow(" + id + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + id);
	if (deleteButton) {
		deleteButton.innerHTML = "Delete";
		deleteButton.setAttribute("onclick", "deleteData(" + id + ")");
	}
};

const saveRow =<T extends string|number> (id:T) => {
	const row = document.getElementsByClassName(
		"row" + id
	) as unknown as HTMLElement[];

	let newRowData: User = {
		id: +id,
		fname: "",
		mname: "",
		lname: "",
		email: "",
		doj:"",
		pno: "",
		role: "",
		address: "",
	};

	for (let i = 0; i < row.length; i++) {
		row[i].contentEditable = "false";
	}
	newRowData.fname = row[0].innerText;
	newRowData.mname = row[1].innerText;
	newRowData.lname = row[2].innerText;
	newRowData.email = row[3].innerText;
	newRowData.doj=row[4].innerText;
	newRowData.pno = row[5].innerText;
	newRowData.role = row[6].innerText;
	newRowData.address = row[7].innerText;
	console.log(newRowData);

	$.ajax({
		url: "http://localhost:3000/editRow",
		type: "POST",
		data: newRowData,
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
			}
		},
	});

	const editButton = document.getElementById("editRow" + id);
	if (editButton) {
		editButton.innerHTML = "Edit";
		editButton.setAttribute("onclick", "editRow(" + id + ")");
	}

	const deleteButton = document.getElementById("deleteRow" + id);
	if (deleteButton) {
		deleteButton.innerHTML = "Delete";
		deleteButton.setAttribute("onclick", "deleteData(" + id + ")");
	}
};

const deleteData =<T extends string|number> (id:T) => {
	// const rowID = document.getElementById("row" + id);
	// if (rowID) rowID.remove();
	const rowReferenceID = '{ "id": ' + id + " }";
	$.ajax({
		url: "http://localhost:3000/deleteRow",
		type: "DELETE",
		headers: JSON.parse(rowReferenceID),
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
			}
		},
	});
};

const loadData = () => {
	getData();
	const loadData = document.getElementById("loadData")!;

	loadData.innerHTML = "Refresh Data";
	loadData.id = "refreshData";
	document
		.getElementById("refreshData")!
		.setAttribute("onclick", "refreshData()");
};

const refreshData = () => {
	document.getElementById("tableBody")!.innerHTML = "";
	getData();
};

const addData = () => {
	let fname: HTMLInputElement = <HTMLInputElement>document.getElementById("firstNameInput")!;
	let mname: HTMLInputElement = <HTMLInputElement>document.getElementById("middleNameInput")!;
	let lname: HTMLInputElement = <HTMLInputElement>document.getElementById("lastNameInput")!;
	let email: HTMLInputElement = <HTMLInputElement>document.getElementById("emailInput")!;
	let doj: HTMLInputElement = <HTMLInputElement>document.getElementById("dojInput")!;
	// @dateformat(doj)
	let phoneNumber: HTMLInputElement = <HTMLInputElement>document.getElementById("phoneNumberInput")!;
	let role: roleObject = {
		superAdmin: <HTMLInputElement>document.getElementById('superAdmin')!,
		admin: <HTMLInputElement>document.getElementById('admin')!,
		subscriber: <HTMLInputElement>document.getElementById('subscriber')!
	}
	let address: HTMLInputElement = <HTMLInputElement>document.getElementById("addressInput")!;
	let dataObject;
	if (role.superAdmin.checked) {
		dataObject = {
			"fname": fname.value,
			"mname": mname.value,
			"lname": lname.value,
			"email": email.value,
			"doj":doj.value,
			"phoneNumber": phoneNumber.value,
			"role": "Super Admin",
			"address": address.value
		}
	} else if (role.admin.checked) {
		dataObject = {
			"fname": fname.value,
			"mname": mname.value,
			"lname": lname.value,
			"email": email.value,
			"doj":doj.value,
			"phoneNumber": phoneNumber.value,
			"role": "Admin",
			"address": address.value
		}
	} else {
		dataObject = {
			"fname": fname.value,
			"mname": mname.value,
			"lname": lname.value,
			"email": email.value,
			"doj":doj.value,
			"phoneNumber": phoneNumber.value,
			"role": "Subscriber",
			"address": address.value
		}
	}
	$.ajax({
		url: "http://localhost:3000/addData",
		type: "POST",
		data: dataObject,
		success: function (result) {
			console.log(result);
			if (result === "success") {
				refreshData();
				fname.value = "";
				mname.value = "";
				lname.value = "";
				email.value = "";
				doj.value="";
				phoneNumber.value = "";
				address.value = "";
			}
		},
	});
};
