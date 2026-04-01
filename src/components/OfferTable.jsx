export default function OfferTable({ scenarios }) {

if(!scenarios.length) return null

return(

<table border="1" style={{margin:"20px auto"}}>

<thead>
<tr>
<th>Vade</th>
<th>Aylık</th>
</tr>
</thead>

<tbody>
{scenarios.map(s=>(
<tr key={s.months}>
<td>{s.months} Ay</td>
<td>{s.monthly_per_machine}</td>
</tr>
))}
</tbody>

</table>

)

}