import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const queryClient = new QueryClient()
function App() {
  const [countryIso, setCountryIso] = useState("NL")

  return (
    <QueryClientProvider client={queryClient}>
      <div className='col flex-center'>
        <h1 className='row flex-center'>Public Holidays</h1>
        <h4 className='row flex-center'>For the current year : {new Date().getFullYear()}</h4>
        <Countries setCountryIso={setCountryIso} countryIso={countryIso} />
        <div className='row sm-4 lg-10 col border border-dashed border-5 border-primary shadow flex-center'>
          <Holidays countryIso={countryIso}/>
        </div>
      </div>
    <footer className='row col align-bottom flex-center'>Data provided by: https://openholidaysapi.org</footer>
    </QueryClientProvider>
  )
}

export default App

function Holidays({countryIso}) {
  const {isPending, data} = useQuery({
    queryKey: ['holidays', countryIso], queryFn: () => getHolidaysByCountry(countryIso),
  })
  if (isPending) {
    return <>Loading holidays...</>
  }
  return <>
    <ul>
      {data?.map((holiday) => {
        return (<li key={holiday.id}><FormattedDate dateString={holiday.startDate} /> - {holiday.name[0]["text"]}</li>)
      })}
    </ul>
  </>
}

function FormattedDate({dateString}) {
  const date = new Date(dateString);
  const formatted = date.toLocaleString('default', {day: "2-digit", month: "long"})
  return <>{formatted}</>
}

function Countries({countryIso, setCountryIso}) {
  const {isPending, data} = useQuery({
    queryKey: ["countries"], queryFn: getCountries,
  })
  if (isPending) {
    return <>Loading countries...</>
  }
  const onChangeCountry = (iso) => {
    setCountryIso(iso)
  }

  return <div className='row flex-center'>
  <label>Country
  <select value={countryIso}
  onChange={(e) => onChangeCountry(e.target.value)} >
    {data?.map((country) => {
      
      return (<option 
        key={country.isoCode} 
        value={country.isoCode}
        >
          {country.name[0]["text"]}</option>)
    })}
    </select>
    </label>
  </div>
}


async function getHolidaysByCountry(countryIso) {
  const baseURL = "https://openholidaysapi.org/PublicHolidays"
  const currentDate = new Date()
  const response = await fetch(`${baseURL}?countryIsoCode=${countryIso}&ValidFrom=${currentDate.getFullYear()}-01-01&ValidTo=${currentDate.getFullYear()}-12-31&languageIsoCode=EN`)
  if(!response.ok) {
    throw new Error("Network response not ok")
  }
  return response.json();
}

async function getCountries() {
  const baseURL = "https://openholidaysapi.org"
  const response = await fetch(baseURL + "/Countries" + "?languageIsoCode=EN")
  if(!response.ok) {
    throw new Error("Network response not ok")
  }
  return response.json();
}