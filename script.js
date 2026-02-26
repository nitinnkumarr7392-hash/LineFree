let places = JSON.parse(localStorage.getItem("places")) || [
{name:"City Hospital",category:"Hospital",updates:[]},
{name:"State Bank",category:"Bank",updates:[]},
{name:"Hanuman Temple",category:"Temple",updates:[]},
{name:"Aadhar Center",category:"Govt",updates:[]}
];

let selectedPlace=null;
let currentCategory="All";

const container=document.getElementById("placesContainer");
const modal=document.getElementById("modal");
const modalTitle=document.getElementById("modalTitle");
const peopleInput=document.getElementById("peopleInput");
const categorySelect=document.getElementById("categorySelect");

setTimeout(()=>{
document.querySelector(".app").classList.remove("hidden");
},2500);

function saveData(){
localStorage.setItem("places",JSON.stringify(places));
}

function calculateStatus(avg){
if(avg<=5) return {text:"Short Line",class:"green"};
if(avg<=15) return {text:"Medium Line",class:"yellow"};
return {text:"Long Line",class:"red"};
}

function render(){
container.innerHTML="";
places
.filter(p=>currentCategory==="All"||p.category===currentCategory)
.forEach(place=>{
let avg=place.updates.length
?Math.round(place.updates.reduce((a,b)=>a+b,0)/place.updates.length)
:0;

let status=calculateStatus(avg);

container.innerHTML+=`
<div class="place-card">
<h3>${place.name}</h3>
<small>${place.category}</small>
<div class="status ${status.class}">
${status.text} (${avg} people)
</div>
<small>Updated: ${place.updates.length?new Date().toLocaleString():"No updates"}</small>
<button onclick="openUpdate('${place.name}')">Update Queue</button>
</div>
`;
});
}

function openUpdate(name){
selectedPlace=name;
modalTitle.innerText=name;
categorySelect.style.display="none";
modal.classList.remove("hidden");
}

function openAdd(){
selectedPlace=null;
modalTitle.innerText="Add New Place";
categorySelect.style.display="block";
modal.classList.remove("hidden");
}

function closeModal(){
modal.classList.add("hidden");
peopleInput.value="";
}

function submit(){
let count=parseInt(peopleInput.value);

if(selectedPlace){
let place=places.find(p=>p.name===selectedPlace);
if(!isNaN(count)) place.updates.push(count);
}else{
let name=peopleInput.value;
let category=categorySelect.value;
if(name){
places.push({name:name,category:category,updates:[]});
}
}

saveData();
render();
closeModal();
}

document.getElementById("submitBtn").onclick=submit;
document.getElementById("closeBtn").onclick=closeModal;
document.getElementById("addPlaceBtn").onclick=openAdd;

document.querySelectorAll(".categories button").forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll(".categories button").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
currentCategory=btn.dataset.cat;
render();
};
});

document.getElementById("searchInput").addEventListener("input",function(){
let value=this.value.toLowerCase();
container.innerHTML="";
places
.filter(p=>p.name.toLowerCase().includes(value))
.forEach(place=>{
container.innerHTML+=`
<div class="place-card">
<h3>${place.name}</h3>
<small>${place.category}</small>
<button onclick="openUpdate('${place.name}')">Update Queue</button>
</div>
`;
});
});

document.getElementById("themeToggle").onclick=()=>{
document.body.classList.toggle("dark");
};

render();
