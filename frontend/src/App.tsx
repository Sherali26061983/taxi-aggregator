import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

type Point = {
  latitude: number
  longitude: number
}

const pickupIcon = new L.DivIcon({
  className: 'taxi-map-marker pickup-marker',
  html: '<span>А</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

const dropoffIcon = new L.DivIcon({
  className: 'taxi-map-marker dropoff-marker',
  html: '<span>Б</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

function MapClickHandler({
  onChoose,
}: {
  onChoose: (point: Point) => void
}) {
  useMapEvents({
    click(event) {
      onChoose({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      })
    },
  })

  return null
}
function MapCenterUpdater({
  point,
}: {
  point: Point | null
}) {
  const map = useMap()

  useEffect(() => {
    if (point) {
      map.setView([point.latitude, point.longitude], map.getZoom())
    }
  }, [point, map])

  return null
}
function App() {
  const [service, setService] = useState<'city' | 'intercity'>('intercity')
  const [choosing, setChoosing] = useState<'pickup' | 'dropoff'>('pickup')
  const [pickup, setPickup] = useState<Point | null>(null)
  const [dropoff, setDropoff] = useState<Point | null>(null)
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')
  const [cityTrip, setCityTrip] = useState({
  pickup: null as Point | null,
  dropoff: null as Point | null,
  pickupAddress: '',
  dropoffAddress: '',
})

const [intercityTrip, setIntercityTrip] = useState({
  pickup: null as Point | null,
  dropoff: null as Point | null,
  pickupAddress: '',
  dropoffAddress: '',
})
  const [savedPlaces, setSavedPlaces] = useState<
  { name: string; address: string; latitude: number; longitude: number }[]
>(() => {
  try {
    const saved = localStorage.getItem('taxiuz-saved-places')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
})
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([])
  const [mapOpen, setMapOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Point | null>(null)
  useEffect(() => {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      setCurrentLocation(point)
      console.log('GPS координаталари:', point)
      setPickup(point)
      updateIntercityDestination(point)
      
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=uz&lat=${point.latitude}&lon=${point.longitude}`,
      )
        .then((response) => {
          if (!response.ok) return null
          return response.json()
        })
        .then((data) => {
          if (data?.display_name) {
            setPickupAddress(data.display_name)
          }
        })
        .catch(() => {
          console.log('Манзилни аниқлаб бўлмади.')
        })

    },
    () => {
      console.log('Жойлашув рухсати берилмади.')
    },
  )
}, [])
useEffect(() => {
  localStorage.setItem(
    'taxiuz-saved-places',
    JSON.stringify(savedPlaces),
  )
}, [savedPlaces])

function changeService(nextService: 'city' | 'intercity') {
  if (nextService === service) return

  const currentTrip = {
    pickup,
    dropoff,
    pickupAddress,
    dropoffAddress,
  }

  if (service === 'city') {
    setCityTrip(currentTrip)
  } else {
    setIntercityTrip(currentTrip)
  }

  const nextTrip =
    nextService === 'city' ? cityTrip : intercityTrip

  setService(nextService)
  setPickup(nextTrip.pickup ?? (nextService === 'city' ? currentLocation : null))
  setDropoff(nextTrip.dropoff)
  setPickupAddress(nextTrip.pickupAddress)
  setDropoffAddress(nextTrip.dropoffAddress)
  setChoosing('pickup')
  setMapOpen(false)
}

function updateIntercityDestination(point: Point) {
  if (service !== 'intercity') return

  const isFergana =
    point.latitude > 40.32 &&
    point.latitude < 40.45 &&
    point.longitude > 71.70 &&
    point.longitude < 71.90

  const destination: Point = isFergana
    ? { latitude: 40.555426, longitude: 71.143545 }
    : { latitude: 40.3864, longitude: 71.7864 }

  setDropoff(destination)
  setDropoffAddress(
    isFergana ? 'Бувайда' : 'Фарғона шаҳри',
  )
}

async function choosePoint(point: Point) {
  
  if (choosing === 'pickup') {
    setPickup(point)
    setPickupAddress('Манзил аниқланмоқда...')

    updateIntercityDestination(point)
  } else {
    setDropoff(point)
    setDropoffAddress('Манзил аниқланмоқда...')
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.latitude}&lon=${point.longitude}`,
    )

    if (!response.ok) return

    const data = await response.json()

    if (data.display_name) {
      if (choosing === 'pickup') {
        setPickupAddress(data.display_name)
      } else {
        setDropoffAddress(data.display_name)
      }
    }
  } catch {
    console.log('Манзилни аниқлаб бўлмади.')
  }
}   


  async function searchAddress(address: string, field: 'pickup' | 'dropoff') {
    if (!address.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=uz&q=${encodeURIComponent(address)}`,
      )

      if (!response.ok) return

      const results = await response.json()

      if (results.length > 0) {
        const point: Point = {
          latitude: Number(results[0].lat),
          longitude: Number(results[0].lon),
        }

        if (field === 'pickup') {
  setPickup(point)
  updateIntercityDestination(point)
        } else {
          setDropoff(point)
        }
      }
    } catch {
      console.log('Манзилни қидиришда хато юз берди.')
    }
  }

  async function loadSuggestions(address: string, field: 'pickup' | 'dropoff') {
    if (address.trim().length < 2) {
      if (field === 'pickup') {
        setPickupSuggestions([])
      } else {
        setDropoffSuggestions([])
      }
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=uz&q=${encodeURIComponent(address)}`,
      )

      if (!response.ok) return

      const results = await response.json()

      if (field === 'pickup') {
        setPickupSuggestions(results)
      } else {
        setDropoffSuggestions(results)
      }
    } catch {
      console.log('Манзил таклифларини олиб бўлмади.')
    }
  }

function savePlace(
  name: string,
  address: string,
  point: Point | null,
) {
  if (!address.trim() || !point) {
    alert('Аввал манзилни танланг.')
    return
  }

  const placeName = name.trim()

  if (!placeName) return

  setSavedPlaces((previous) => {
    const updatedPlace = {
      name: placeName,
      address: address.trim(),
      latitude: point.latitude,
      longitude: point.longitude,
    }

    const existingIndex = previous.findIndex(
      (place) => place.name === placeName,
    )

    if (existingIndex === -1) {
      return [...previous, updatedPlace]
    }

    return previous.map((place, index) =>
      index === existingIndex ? updatedPlace : place,
    )
  })

  alert(`«${placeName}» манзили сақланди.`)
}

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="/">Taxi<span>UZ</span></a>
        <span className="status"><i /> Хизмат онлайн</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">СИЗНИНГ ЙЎЛИНГИЗ, СИЗНИНГ ТАНЛОВИНГИЗ</span>
          <h1>Манзилингизга<br />осонроқ <span>етиб боринг.</span></h1>
          <p>Шаҳар ичида ёки шаҳарлараро — сафарингизни ўзингизга қулай тарзда режалаштиринг.</p>
        </div>

        <section className="booking">
          <div className="booking-heading">
            <div>
              <span className="eyebrow">САФАРНИ РЕЖАЛАШТИРИНГ</span>
              <h2>Қаерга борамиз?</h2>
            </div>
            <span className="route-icon">↗</span>
          </div>

          <div className="service-switch">
            <button className={service === 'city' ? 'active' : ''} onClick={() => changeService('city')}>
              ⌂ Шаҳар таксиси
            </button>
            <button className={service === 'intercity' ? 'active' : ''} onClick={() => changeService('intercity')}>
              ⇄ Шаҳарлараро
            </button>
          </div>

          <label className="field">
            <span className="field-icon pickup">●</span>
            <span className="field-content">
              <span className="field-label">ОЛИБ КЕТИШ МАНЗИЛИ</span>
              <input
  value={pickupAddress}
  onChange={(event) => {
  setPickupAddress(event.target.value)
  loadSuggestions(event.target.value, 'pickup')
}}
  onBlur={() => searchAddress(pickupAddress, 'pickup')}
  placeholder="Манзилни киритинг"
/>
            </span>
            
              {pickupSuggestions.length > 0 && (
                <div className="suggestions">
                  {pickupSuggestions.map((item: any, index: number) => (
                    <button
                      type="button"
                      key={index}
                      onMouseDown={() => {
                        setPickupAddress(item.display_name)
                        const point: Point = {
  latitude: Number(item.lat),
  longitude: Number(item.lon),
}

setPickup(point)
updateIntercityDestination(point)
setPickupSuggestions([])
                      }}
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}

            <button className="gps" type="button" title="Харитадан танлаш" onClick={() => { setChoosing('pickup'); setMapOpen(true) }}>⌖</button>
          </label>

          <div className="route-line"><span /></div>

          <label className="field">
            <span className="field-icon dropoff">●</span>
            <span className="field-content">
              <span className="field-label">БОРИШ МАНЗИЛИ</span>
              
<input
  value={dropoffAddress}
  onChange={(event) => {
  setDropoffAddress(event.target.value)
  loadSuggestions(event.target.value, 'dropoff')
}}
  onBlur={() => searchAddress(dropoffAddress, 'dropoff')}
  placeholder="Бориш манзилини киритинг"
/>

              {dropoffSuggestions.length > 0 && (
                <div className="suggestions">
                  {dropoffSuggestions.map((item: any, index: number) => (
                    <button
                      type="button"
                      key={index}
                      onMouseDown={() => {
                        setDropoffAddress(item.display_name)
                        setDropoff({
                          latitude: Number(item.lat),
                          longitude: Number(item.lon),
                        })
                        setDropoffSuggestions([])
                      }}
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}

            </span>
            <button className="gps" type="button" title="Харитадан танлаш" onClick={() => { setChoosing('dropoff'); setMapOpen(true) }}>⌖</button>
          </label>
<div className="saved-place-buttons">
  <button
    type="button"
    onClick={() => savePlace('Уй', pickupAddress, pickup)}
  >
    🏠 Уйни сақлаш
  </button>

  <button
    type="button"
    onClick={() => savePlace('Иш', pickupAddress, pickup)}
  >
    💼 Ишни сақлаш
  </button>

  <button
    type="button"
    onClick={() => savePlace('Севимли манзил', pickupAddress, pickup)}
  >
    ⭐ Севимли манзилни сақлаш
  </button>
</div>
{savedPlaces.length > 0 && (
  <div className="saved-places">
    <h3>Сақланган манзиллар</h3>

    {savedPlaces.map((place, index) => (
      <div className="saved-place" key={`${place.name}-${index}`}>
        <span>
          {place.name}: {place.address}
        </span>

        <button
          type="button"
          onClick={() => {
            setPickupAddress(place.address)
            setPickup({
              latitude: place.latitude,
              longitude: place.longitude,
            })
          }}
        >
          Олиб кетиш манзили
        </button>
                <button
          type="button"
          onClick={() => {
            setDropoffAddress(place.address)
            setDropoff({
              latitude: place.latitude,
              longitude: place.longitude,
            })
          }}
        >
          Бориш манзили
        </button>
        <button
  type="button"
  onClick={() => {
    const confirmed = window.confirm(
      `«${place.name}» манзилини ўчирасизми?`,
    )

    if (confirmed) {
      setSavedPlaces((previous) =>
        previous.filter((item) => item.name !== place.name),
      )
    }
  }}
>
  ✕ Ўчириш
</button>
      </div>
    ))}
  </div>
)}
          <button className="map-select" onClick={() => setMapOpen(!mapOpen)}>
            <span>⌖</span> {mapOpen ? 'Харитани ёпиш' : 'Харитадан манзил танлаш'} <span className="arrow">→</span>
          </button>

          {mapOpen && (
            <div className="map-panel">
              <p>Харитани босинг: {choosing === 'pickup' ? 'олиб кетиш' : 'бориш'} нуқтасини танланг.</p>
              <MapContainer
                center={
  currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : [40.3864, 71.7864]
}
                zoom={15}
                scrollWheelZoom
                style={{ height: 320, width: '100%', borderRadius: 12 }}
              >
                <MapCenterUpdater point={choosing === 'pickup' ? pickup : dropoff} />
                {service === 'city' && currentLocation && (
  <Circle
    center={[currentLocation.latitude, currentLocation.longitude]}
    radius={20000}
    pathOptions={{
  color: '#1565c0',
  fillColor: '#42a5f5',
  fillOpacity: 0.18,
  weight: 3,
}}
  />
)}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                />
                <MapClickHandler onChoose={choosePoint} />
                {pickup && <Marker position={[pickup.latitude, pickup.longitude]} icon={pickupIcon} />}
                {dropoff && <Marker position={[dropoff.latitude, dropoff.longitude]} icon={dropoffIcon} />}
              </MapContainer>
              <button
  className="submit"
  onClick={async () => {
    const point = choosing === 'pickup' ? pickup : dropoff

    if (!point) {
      alert('Илтимос, харитадан нуқтани танланг.')
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=uz&lat=${point.latitude}&lon=${point.longitude}`,
      )

      if (!response.ok) {
        alert('Манзилни аниқлаб бўлмади. Қайта уриниб кўринг.')
        return
      }

      const data = await response.json()
      const address = data.display_name

      if (!address) {
        alert('Бу нуқта учун манзил топилмади.')
        return
      }

      if (choosing === 'pickup') {
        setPickupAddress(address)
      } else {
        setDropoffAddress(address)
      }

      setMapOpen(false)
    } catch {
  const address = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`

  if (choosing === 'pickup') {
    setPickupAddress(address)
  } else {
    setDropoffAddress(address)
  }

  setMapOpen(false)
}
  }}
>
  Нуқтани тасдиқлаш
</button>
              <p className="note">Танланган нуқта координаталари манзил майдонига ёзилади. Манзил номи ҳозирча автоматик аниқланмайди.</p>
            </div>
          )}

          <button className="submit" onClick={() => alert('Харита нуқталари танланди. Буюртма беришни кейинги босқичда backend билан улаймиз.')}>
            Сафарни режалаштириш <span>→</span>
          </button>
          <p className="note">Бу дастлабки версия. Ҳозирча буюртма серверга юборилмайди.</p>
        </section>
      </section>

      <section className="features">
        <div><span>01</span><h3>Қулай манзил танлаш</h3><p>Манзилни киритиш ёки харитадан нуқта танлаш.</p></div>
        <div><span>02</span><h3>Икки хил сафар</h3><p>Шаҳар ичида ва шаҳарлараро хизматлар.</p></div>
        <div><span>03</span><h3>Сизга мос сафар</h3><p>Йўналишни ўзингиз танланг.</p></div>
      </section>

      <footer>© 2026 TaxiUZ <span>Йўлингиз бехатар бўлсин!</span></footer>
    </main>
  )
}

export default App