import {useState, useEffect} from 'react'
import {useSocket} from '../context/socket'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Map from '../components/Map'

type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
type LocationStatus = 'accessed' | 'denied' | 'unknown' | 'error'
type GeolocationPosition = {
  lat: number;
  lng: number;
}
type RoomInfo = {
  roomId: string;
  position: GeolocationPosition;
}

export default function Home() {
  const {socket, connectSocket} = useSocket()
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected')
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('unknown')
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [navigatorWatchId, setNavigatorWatchId] = useState<number | null>(null)
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)


  function connectToSocketServer() {
    connectSocket()
    setSocketStatus('connecting')
  }

  useEffect(() => {
    let watchId: number | null = null
    if('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition((position) => {
      setPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      setLocationStatus('accessed')
      }, (error) => {
        handleLocationError(error)
      })
      setNavigatorWatchId(watchId)
      return () => {
        if(watchId) {
          navigator.geolocation.clearWatch(watchId)
        }
      }
    }
  }, [])


  function handleLocationError(error: GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationStatus('denied')
        break
      case error.POSITION_UNAVAILABLE:
        setLocationStatus('unknown')
        break
      case error.TIMEOUT:
        setLocationStatus('error')
        break
      default:
        setLocationStatus('error')
        break
    }
  }

  useEffect(() => {
    if(socket) {
      socket.on('connect', () => {
        setSocketStatus('connected')
        socket.emit('createRoom', {
          position
        })

        socket.on('roomCreated', (data: {roomId: string, msg: string, position: GeolocationPosition}) => {
          console.log(data)
          toast.success('You are live!', {
            autoClose: 2000,
            })
          setRoomInfo(data)
        })


      })

      socket.on('disconnect', () => {
        setSocketStatus('disconnected')
      })
    }
  }, [socket])

  function stopSharingLocation() {
    if (navigatorWatchId) {
      navigator.geolocation.clearWatch(navigatorWatchId)
      setNavigatorWatchId(null)
      setPosition(null)
      socket.disconnect()
    }
  }


  return (
    <div className='flex justify-center'>
      <div className='flex flex-col md:min-w-[900px] md:max-w-[1200px] p-2 mb-5'>
        <section className='mb-4'>
          <div className='mb-10 mt-10'>
            <h1 className='text-3xl text-gray-900 font-bold'>LocShare</h1>
            <h2 className='text-lg text-gray-800 font-semibold'>Real-Time Location Sharing, Made Easy</h2>
          </div>
          {
            !socket && (
              <div className='flex flex-wrap gap-2 items-start mb-5'>
                <button 
                  className='bg-orange-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'
                  onClick={() => {
                    if(locationStatus === 'accessed') {
                      connectToSocketServer()
                    } else {
                      toast.error('Please allow location access', {
                        autoClose: 2000,
                      })
                    }
                  }}
                  >{locationStatus === 'accessed' ? 'Share Location' : 'Access Location'}</button>
                <span className='flex gap-1'>
                  <input type = "text" placeholder = "Enter a link" className='border border-blue-300 bg-gray-300 rounded-md p-2 outline-none ring-0 text-sm font-medium' />
                  <button className='bg-yellow-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'>Join</button>
                </span>
              </div>
            )
          }
          {
            position ? (
              <div className='flex gap-2 justify-end text-gray-900 mb-2'>
                <p className='font-bold text-sm'>Lat: <span className='text-lg font-bold'>{position.lat} | </span></p>
                <p className='font-bold text-sm'>Lng: <span className='text-lg font-bold'>{position.lng}</span></p>
              </div>
            ): null
          }
        </section>

        <section className='mb-4 flex w-full gap-2'>
          <div className={`p-3 w-full border-2 border-blue-400 rounded-md ${locationStatus === 'accessed' ? 'bg-green-400' : 'bg-red-400'}`}>
            <p className='text-xs font-semibold text-black'>location {locationStatus}</p>
          </div>
          <div className={`p-3 w-full border-2 border-blue-400 rounded-md ${socketStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}>
            <p className='text-xs font-semibold text-black'>{socketStatus}</p>
          </div>
        </section>
        <section className='mb-4'>
        {
           socketStatus === 'connected' && roomInfo && (
              <div className='flex flex-col items-start bg-yellow-400 p-2 rounded-md'>
                <p><span className='text-md font-semibold text-gray-700'>{`${window.location.href}${roomInfo.roomId}`}</span></p>
              </div>
            )
          }
        </section>

        {
          position && (
            <section className='bg-gray-200 rounded-md overflow-hidden'>
              <div className=''>
                <Map location={position}/>
              </div>
            </section>
          )
        }
      </div>
    </div>
  )
}
