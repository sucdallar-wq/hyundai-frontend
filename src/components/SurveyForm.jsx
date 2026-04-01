import { useState, useEffect } from "react"

export default function SurveyForm({ onChange }) {

const surveyQuestions = [
"Çalışma Alanı (İç/Dış)",
"Zemin Durumu",
"Tümsek / Engeller",
"Eğim",
"Tozlu Ortam",
"Islak Zemin",
"Yüksek Sıcaklık",
"Soğuk Depo",
"Servis Uzaklığı",
"İtme / Çekme Kullanımı",
"Operatör Yoğunluğu"
]

const [answers,setAnswers] =
useState(Array(surveyQuestions.length).fill(1))

useEffect(()=>{
onChange(answers)
},[answers])

const updateAnswer = (i,val)=>{
const arr = [...answers]
arr[i] = Number(val)
setAnswers(arr)
}

return(

<div>

<h3>Saha Analizi</h3>

{surveyQuestions.map((q,i)=>(
<div key={i} style={{marginBottom:10}}>

<div style={{fontWeight:500}}>
{q}
</div>

<select
value={answers[i]}
onChange={e=>updateAnswer(i,e.target.value)}
>
<option value={1}>İyi</option>
<option value={3}>Orta</option>
<option value={4}>Zor</option>
</select>

</div>
))}

</div>

)

}