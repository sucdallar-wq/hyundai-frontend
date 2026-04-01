export default function MachineSelector({ machines, model, setModel }) {

return(

<select value={model} onChange={e=>setModel(e.target.value)}>

<option value="">Model seç</option>

{machines.map(m=>(
<option key={m.id} value={m.model_code}>
{m.model_code} - {m.model_name}
</option>
))}

</select>

)

}