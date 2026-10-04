const countries = [
  {id:"syria",ar:"سوريا",en:"Syria",flag:"🇸🇾"},
  {id:"egypt",ar:"مصر",en:"Egypt",flag:"🇪🇬"},
  {id:"lebanon",ar:"لبنان",en:"Lebanon",flag:"🇱🇧"},
  {id:"turkey",ar:"تركيا",en:"Türkiye",flag:"🇹🇷"}
];

// Demo values only. Replace from the future admin/backend; never present these as live rates.
const rates = {syria:1, egypt:1, lebanon:1, turkey:1};
const commissions = {cash:0, wallet:0, bank:0};

const $ = s => document.querySelector(s);
function fillCountries(select){
  select.innerHTML = countries.map(c=>`<option value="${c.id}">${c.flag} ${c.ar}</option>`).join("");
}
fillCountries($("#calcCountry")); fillCountries($("#sendCountry"));

$("#countriesGrid").innerHTML = countries.map(c=>`
  <article class="country-card" onclick="location.hash='send'; setCountry('${c.id}')">
    <div class="flag">${c.flag}</div><h3>${c.ar}</h3><p>${c.en}</p><button>إرسال حوالة</button>
  </article>`).join("");

window.setCountry = id => { $("#sendCountry").value=id; };

function calculate(){
  const amount = Number($("#calcAmount").value||0);
  const country = $("#calcCountry").value;
  const method = $("#calcMethod").value;
  if(!amount){$("#calcResult").textContent="—";$("#calcDetails").textContent="أدخل المبلغ لإظهار النتيجة.";return}
  const commission = commissions[method] || 0;
  const received = Math.max(0, amount - commission) * (rates[country] || 1);
  $("#calcResult").textContent = received.toLocaleString("ar-IQ",{maximumFractionDigits:2});
  $("#calcDetails").textContent = `سعر الصرف: ${rates[country] || 1} • العمولة: ${commission} • ${country}`;
}
["calcAmount","calcCountry","calcCurrency","calcMethod"].forEach(id=>$("#"+id).addEventListener("input",calculate));
$("#calcCountry").addEventListener("change",calculate);
$("#calcMethod").addEventListener("change",calculate);

function toggleMethods(){
  const m=$("#sendMethod").value;
  $("#walletFields").classList.toggle("show",m==="wallet");
  $("#bankFields").classList.toggle("show",m==="bank");
}
$("#sendMethod").addEventListener("change",toggleMethods); toggleMethods();

function orderId(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s="MS-"; for(let i=0;i<6;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
$("#transferForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());
  const id=orderId();
  const text =
`طلب حوالة جديد - ماسة الشام
رقم الطلب: ${id}
اسم المرسل: ${data.senderName}
رقم الهاتف: ${data.senderPhone}
المدينة: ${data.senderCity||"غير محدد"}
الدولة: ${$("#sendCountry").selectedOptions[0].textContent}
المبلغ: ${data.amount} ${data.currency}
المستفيد: ${data.recipientName}
هاتف المستفيد: ${data.recipientPhone||"غير محدد"}
مدينة المستفيد: ${data.recipientCity||"غير محدد"}
طريقة الاستلام: ${$("#sendMethod").selectedOptions[0].textContent}
${data.walletName?`المحفظة: ${data.walletName}\nرقم المحفظة: ${data.walletNumber}`:""}
${data.bankName?`البنك: ${data.bankName}\nصاحب الحساب: ${data.accountName}\nرقم الحساب: ${data.accountNumber}\nIBAN: ${data.iban}\nSWIFT: ${data.swift}`:""}
التاريخ: ${new Date().toLocaleString("ar-IQ")}

هذا طلب مراجعة، وليس تنفيذًا تلقائيًا.`;
  localStorage.setItem("masa_last_order",JSON.stringify({id,status:"تم إنشاء الطلب",data}));
  $("#trackId").value=id;
  window.open("https://wa.me/9647772073950?text="+encodeURIComponent(text),"_blank","noopener");
  alert(`تم إنشاء رقم الطلب: ${id}\nسيتم فتح WhatsApp لإرسال الطلب.`);
});

const statuses=["تم إنشاء الطلب","قيد المراجعة","تم قبول الحوالة","قيد التنفيذ","تم إرسال الحوالة","جاهزة للاستلام","مكتملة","ملغاة"];
$("#trackBtn").addEventListener("click",()=>{
  const id=$("#trackId").value.trim().toUpperCase();
  const saved=JSON.parse(localStorage.getItem("masa_last_order")||"null");
  if(!id || !saved || saved.id!==id){
    $("#trackResult").innerHTML='<p>لم يتم العثور على حوالة بهذا الرقم. يرجى التأكد من الرقم أو التواصل مع خدمة العملاء عبر WhatsApp.</p>'; return;
  }
  $("#trackResult").innerHTML=`<h3>الحوالة ${saved.id}</h3><div class="timeline">${statuses.map((s,i)=>`<span class="status ${i===0?'active':''}">${s}</span>`).join("")}</div><p>الحالة الحالية: <b>${saved.status}</b></p>`;
});

document.querySelectorAll(".copy").forEach(btn=>btn.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(btn.dataset.number);btn.textContent="تم النسخ ✓";setTimeout(()=>btn.textContent="نسخ الرقم",1500)}
  catch{alert("تعذر النسخ تلقائيًا؛ انسخ الرقم يدويًا.")}
}));

$("#menu").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#lang").addEventListener("click",()=>{
  document.documentElement.lang="en";
  document.documentElement.dir="ltr";
  alert("نسخة الإنجليزية الكاملة يمكن توسيعها في ملف ترجمة منفصل دون تغيير منطق الحوالات.");
});
