import { Link } from "react-router-dom"

export default function Dashboard(){

return(

<div style={{textAlign:"center", marginTop:"100px"}}>

<h1>Forklift Teklif Sistemi</h1>

<br/>

<Link to="/maintenance">
<button style={{margin:"10px"}}>
Bakım Teklifi
</button>
</Link>

<Link to="/rental">
<button style={{margin:"10px"}}>
Kiralama Teklifi
</button>
</Link>

<Link to="/offers">
<button style={{margin:"10px"}}>
Teklifler
</button>
</Link>

</div>

)

}