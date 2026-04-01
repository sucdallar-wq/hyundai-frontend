import { useState } from "react"
import api from "../services/api"

export default function RentalOffer(){

const [model,setModel] = useState("")
const [customer,setCustomer] = useState("")
const [email,setEmail] = useState("")

const createOffer = async ()=>{

await api.post("/rental-offer-auto",{

customer:customer,
email:email,
model:model,
machine_count:1,
yearly_hours:2000,
interest_rate:18,
insurance_rate:2.5,
profit_margin:10,
management_fee_monthly:50,
answers:[1,3,1,1,3,1,1,1,3,1,4],
send_email:true

})

}

return(

<div>

<h2>Kiralama Teklifi</h2>

<input placeholder="Müşteri"
onChange={(e)=>setCustomer(e.target.value)}
/>

<input placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<input placeholder="Model"
onChange={(e)=>setModel(e.target.value)}
/>

<button onClick={createOffer}>
Teklif Oluştur
</button>

</div>

)

}