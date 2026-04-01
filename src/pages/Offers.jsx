import { useEffect,useState } from "react"
import api from "../services/api"

export default function Offers(){

const [offers,setOffers] = useState([])

useEffect(()=>{

loadOffers()

},[])

const loadOffers = async ()=>{

const res = await api.get("/offers")

setOffers(res.data)

}

return(

<div>

<h2>Teklifler</h2>

{offers.map(o=>(
<div key={o.id}>

{o.customer} - {o.model}

</div>
))}

</div>

)

}