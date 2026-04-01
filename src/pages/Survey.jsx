import { useState } from "react"
import api from "../services/api"

export default function Survey(){

const [answers,setAnswers] = useState([1,1,1,1,1,1,1,1,1,1,1])

const calculate = async ()=>{

const response = await api.post("/survey-calculate",{
answers:answers
})

console.log(response.data)

}

return(

<div>

<h2>Usage Survey</h2>

<button onClick={calculate}>
Hesapla
</button>

</div>

)

}