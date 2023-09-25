import React, {useState, useEffect} from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type GeolocationPosition = {
  lat: number;
  lng: number;
}

function LocationMarker({location}: {location: GeolocationPosition}) {

  const map = useMapEvents({

  })

  const [position, setPosition] = useState({
    lat: location.lat,
    lng: location.lng
  })
  
  useEffect(() => {
    setPosition({
      lat: location.lat,
      lng: location.lng
    })
    map.flyTo([location.lat, location.lng])
    map.locate()
  }, [location])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}


function Map({location}: {location: GeolocationPosition}) {

  if(!location) return 'No location found'


  return (
    <div className='w-full bg-gray-100 h-[600px] md:h-[800px]'>
      <MapContainer center = {[location.lat, location.lng]} zoom={30} scrollWheelZoom={true} className='h-screen' >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <LocationMarker location={location}/>
      </MapContainer>
    </div>
  )
}

export default Map