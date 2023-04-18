import $ from "jquery";

class User{
    constructor(
        public id:number,
        public fname:string,
        public mname:string,
        public lname:string,
        public email:string,
        public phoneno:string,
        public role:Role|string,
        public address:string
    ){}
}

enum Role{
    SuperAdmin="SuperAdmin",
    Admin="Admin",
    Subscriber="Subscriber",
}

interface roleobject{
    Superadmin:HTMLInputElement,
    admin:HTMLInputElement,
    subscriber:HTMLInputElement,
}

const getData = () =>{
    $.ajax({
        url:"http://localhost:3000/refreshData",
        success:function(result){
            fillTable(JSON.stringify(result));
        },
    });
};

let editRowElement:string[];

const fillTable = (data:string)=>{
    const users:User[]=JSON.parse(data);
    for(let i =0; i<users.length;i++){
        const user=users[i];
        const id=user.id;
        document.getElementById("tablebody")!.innerHTML+=`<tr id="row${id}">
        <td><div class="row${id}">${user.fname}</div></td>
        <td><div class="row${id}">${user.mname}</div></td>
        <td><div class="row${id}">${user.lname}</div></td>
        <td><div class="row${id}">${user.email}</div></td>
        <td><div class="row${id}">${user.phoneno}</div></td>
        <td><div class="row${id}">${user.role}</div></td>
        <td><div class="row${id}">${user.address}</div></td>
        <td><button id="editRow${id}" type="button" onclick="editRow(${id})" class="btn btn-success">Edit</button></td>
        <td><button id="deleteRow${id}" type="button" onclick="deleteData(${id})" class="btn btn-danger delete${id}">Delete</button></td>
        </tr>`;
    }
}

const editRow = (rowId:number | string) =>{
    const row=document.getElementsByClassName(
        "row"+rowId
    ) as unknown as HTMLElement[];
    editRowElement=[];
    for(let i=0;i<row.length;i++){
        row[i].contentEditable="true";
        editRowElement.push(row[i].innerHTML);
    }

    const editButton = document.getElementById("editRow"+rowId);
    if(editButton){
        editButton.innerHTML="Save";
        editButton.setAttribute("onclick","saveRow("+rowId+")");
    }

    const deleteButton=document.getElementById("deleteRow"+rowId);
    if(deleteButton){
        deleteButton.innerHTML="Cancel";
        deleteButton.setAttribute("onclick","cancelRowEdit("+rowId+")");
    }
};

const cancelRowEdit = (id:number|string) =>{
    let row=document.getElementsByClassName(
        "row"+id
    )as unknown as HTMLElement[];
    for(let i=0;i<7;i++){
        row[i].innerHTML=editRowElement[i];
        row[i].contentEditable="false";
    }
    const editButton = document.getElementById("editRow"+id);
    if(editButton){
        editButton.innerHTML="Edit";
        editButton.setAttribute("onclick","editRow("+id+")");
    }

    const deleteButton=document.getElementById("deleteRow"+id);
    if(deleteButton){
        deleteButton.innerHTML="Delete";
        deleteButton.setAttribute("onclick","deleteData("+id+")");
    }
};

const saveRow = (id:number|string)=>{
    const row=document.getElementsByClassName(
        "row"+id
    )as unknown as HTMLElement[];

    let newRowdata:User={
        id:+id,
        fname:"",
        mname:"",
        lname:"",
        email:"",
        phoneno:"",
        role:"",
        address:"",
    };
    for (let i = 0; i < row.length; i++) {
        row[i].contentEditable="false";
    }
    newRowdata.fname=row[0].innerText;
    newRowdata.mname=row[1].innerText;
    newRowdata.lname=row[2].innerText;
    newRowdata.email=row[3].innerText;
    newRowdata.phoneno=row[4].innerText;
    newRowdata.role=row[5].innerText;
    newRowdata.address=row[6].innerText;
    console.log(newRowdata);

    $.ajax({
        url:"http://localhost:3000/editRow",
        type:"POST",
        data:newRowdata,
        success:function(result){
            console.log(result);
            if(result==="success"){
                refreshData();
            }
        },
    });

    const editButton = document.getElementById("editRow"+id);
    if(editButton){
        editButton.innerHTML="Edit";
        editButton.setAttribute("onclick","editRow("+id+")");
    }

    const deleteButton=document.getElementById("deleteRow"+id);
    if(deleteButton){
        deleteButton.innerHTML="Delete";
        deleteButton.setAttribute("onclick","deleteData("+id+")");
    }
};

const deleteData = (id:number|string)=>{
    const rowRefrenceID='{"id":'+id+"}";
    $.ajax({
        url:"http://localhost:3000/deleteRow",
        type:"DELETE",
        headers:JSON.parse(rowRefrenceID),
        success:function(result){
            console.log(result);
            if(result==="success"){
                refreshData();
            }
        },
    });
};

const loaddData=()=>{
    getData();
    const loaddata=document.getElementById("loaddata")!;

    loaddata.innerHTML="Refresh Data";
    loaddata.id="refreshData";
    document.getElementById("refreshData")!
    .setAttribute("onclick","refreshData()");
};

const refreshData = () =>{
    document.getElementById("tablebody")!.innerHTML="";
    getData();
};

const addData = () =>{
    let fname:HTMLInputElement=<HTMLInputElement>document.getElementById("firstname")!;
    let mname:HTMLInputElement=<HTMLInputElement>document.getElementById("middlename")!;
    let lname:HTMLInputElement=<HTMLInputElement>document.getElementById("lastname")!;
    let email:HTMLInputElement=<HTMLInputElement>document.getElementById("email")!;
    let phoneno:HTMLInputElement=<HTMLInputElement>document.getElementById("phoneno")!;
    let role:roleobject={
        Superadmin:<HTMLInputElement>document.getElementById('Superadmin')!,
        admin:<HTMLInputElement>document.getElementById('admin')!,
        subscriber:<HTMLInputElement>document.getElementById('subscriber')!,
    }
    let address:HTMLInputElement=<HTMLInputElement>document.getElementById("address")!;
    let dataobject;
    if(role.Superadmin.checked){
        dataobject={
            "fname":fname.value,
            "mname":mname.value,
            "lname":lname.value,
            "email":email.value,
            "phoneno":phoneno.value,
            "role":"Super Admin",
            "address":address.value
        }
    }else if(role.admin.checked){
        dataobject={
            "fname":fname.value,
            "mname":mname.value,
            "lname":lname.value,
            "email":email.value,
            "phoneno":phoneno.value,
            "role":"Admin",
            "address":address.value
        }
    }else{
        dataobject={
            "fname":fname.value,
            "mname":mname.value,
            "lname":lname.value,
            "email":email.value,
            "phoneno":phoneno.value,
            "role":"Subscriber",
            "address":address.value
        }
    }

    $.ajax({
        url:"http://localhost:3000/addData",
        type:"POST",
        data:dataobject,
        success:function(result){
            console.log(result);
            if(result==="success"){
                refreshData();
                fname.value="";
                mname.value="";
                lname.value="";
                email.value="";
                phoneno.value="";
                address.value="";
            }
        },
    });
};