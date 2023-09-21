import {useState, useEffect} from 'react'
import {useSocket} from '../context/socket'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
  const [watchId, setWatchId] = useState<number | null>(null)
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)


  function connectToSocketServer() {
    connectSocket()
    setSocketStatus('connecting')
  }

  useEffect(() => {
    if(locationStatus === 'accessed') {
      const watchId = navigator.geolocation.watchPosition((position) => {
        setPosition(position)
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('unknown')
            break
          case error.TIMEOUT:
            console.log('timeout')
            setLocationStatus('error')
            break
          default:
            setLocationStatus('error')
            break
        }
      })
      setWatchId(watchId)
      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  function askLocationPermission() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus('accessed')
        connectToSocketServer()
      }, (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('unknown')
            break
          case error.TIMEOUT:
            console.log('timeout')
            setLocationStatus('error')
            break
          default:
            setLocationStatus('error')
            break
        }
      })
    }
  }

  useEffect(() => {
    if(socket) {
      
      socket.on('connect', () => {
        setSocketStatus('connected')
        toast.success('Connected to server!', {
          autoClose: 2000,
        })
        
        socket.emit('createRoom', {
          position
        })

        socket.on('roomCreated', (data: {roomId: string, msg: string, position: GeolocationPosition}) => {
          console.log(data)
          toast.success(`${data.msg}`, {
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
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setPosition(null)
      socket.disconnect()
    }
  }


  return (
    <div className='flex justify-center'>
      <div className='flex flex-col md:min-w-[650px] p-2'>
        <section>
          <div className='mb-10 mt-10'>
            <h1 className='text-3xl text-gray-900 font-bold'>LocShare</h1>
            <h2 className='text-lg text-gray-800 font-semibold'>Real-Time Location Sharing, Made Easy</h2>
          </div>
          {
            !socket && (
              <div className='flex flex-wrap gap-2 items-start mb-5'>
                <button 
                  className='bg-green-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'
                  onClick={askLocationPermission}
                  >Share Location</button>
                <span className='flex gap-1'>
                  <input type = "text" placeholder = "Enter a code or link" className='border border-blue-300 bg-gray-300 rounded-md p-2 outline-none ring-0 text-sm font-medium' />
                  <button className='bg-yellow-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'>Join</button>
                </span>
              </div>
            )
          }
        </section>

        <section className='mb-4 flex flex-col gap-2'>
          <div className={`p-3 border-2 border-blue-400 rounded-md ${locationStatus === 'accessed' ? 'bg-green-400' : 'bg-red-400'}`}>
            <p className='text-xs font-semibold text-black'>location {locationStatus}</p>
          </div>
          <div className={`p-3 border-2 border-blue-400 rounded-md ${socketStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}>
            <p className='text-xs font-semibold text-black'>{socketStatus}</p>
          </div>
        </section>

        <section className='bg-gray-200 rounded-md'>
          <div className='h-[50vh] w-full'>

          </div>
        </section>
      </div>
    </div>
  )
}
