import {useState, useEffect} from 'react'
import {useSocket} from '../context/socket'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../components/Header'
import Status from '../components/Status'
import Map from '../components/Map'
import { GeolocationPosition, SocketStatus, LocationStatus } from '../types'
import {MdOutlineLocationOn, MdOutlineLocationOff} from 'react-icons/md'
import {LuCopy} from 'react-icons/lu'


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
          lng: position.coords.longitude
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
      socket.emit('updateLocation', {
        position
      })
    }
  }, [position])

  useEffect(() => {
    if(socket) {
      socket.on('connect', () => {
        setSocketStatus('connected')
        socket.emit('createRoom', {
          position
        })
      })

      socket.on('roomCreated', (data: {roomId: string, msg: string, position: GeolocationPosition}) => {
        console.log(data)
        toast.success('You are live!', {
          autoClose: 2000,
          })
        setRoomInfo(data)
      })

      socket.on('userJoinedRoom', (data) => {
        console.log('someone joined the room', data)
        position && socket.emit('updateLocation', {
          position
        })
        toast.info(`${data.userId} joined the room`, {
          autoClose: 2000,
        })
      })

      socket.on("connect_error", (err:any) => {
        console.log(`connect_error due to ${err.message}`)
      })

      socket.on('disconnect', () => {
        setSocketStatus('disconnected')
      })
    }
  }, [socket])

  function stopSharingLocation() {
      socket.disconnect()
      setSocketStatus('disconnected')
      setRoomInfo(null)
      toast.success('You are no longer live!', {
        autoClose: 2000,
      })
  }


  return (
    <div className='flex justify-center p-3'>
      <div className='flex flex-col md:min-w-full xl:min-w-[1100px] xl:max-w-[1200px] mb-4'>
        <section className='pt-4 pb-20'>
          <Header/>
        </section>

        <section className='pb-2'>
          <div className='mb-4 bg-slate-600 rounded-md p-3 flex flex-wrap gap-3 justify-between items-center w-full'>
            <Status locationStatus = {locationStatus} socketStatus={socketStatus}/>
            {
              position && (
                <div className='flex gap-2 justify-end text-gray-200'>
                  <p className='font-bold text-sm'>Lat: <span className='text-lg font-bold'>{position.lat} | </span></p>
                  <p className='font-bold text-sm'>Lng: <span className='text-lg font-bold'>{position.lng}</span></p>
                </div>
              )
            }
          </div>
        </section>
        <section className='flex flex-col lg:flex-row gap-4 w-full'>
          <div className={`flex flex-col justify-between gap-4 h-min w-full bg-slate-500 px-4 py-6 rounded-xl lg:h-full lg:min-w-[20rem] ${position ? 'lg:max-w-sm' : 'w-full'}`}>
            <article className='flex flex-col gap-3 w-full'>
              {
                socketStatus === 'disconnected' && (
                  <div className='flex flex-col gap-6 items-start w-full'>
                    <button 
                      className='bg-purple-800 text-xl text-white font-bold py-2 px-2 rounded-md'
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
                      <input type = "text" placeholder = "Enter a link" className='bg-gray-300 rounded-md p-2 outline-none ring-0 text-md font-medium' />
                      <button className='bg-yellow-400 text-xl text-gray-700 font-bold py-2 px-4 rounded-md'>Join</button>
                    </span>
                </div>
                )
              }
              {
                socketStatus === 'connected' && roomInfo && (
                  <>
                    <div className='flex gap-2 items-center justify-between bg-gray-300 rounded-md p-3'>
                      <p className='text-md font-bold break-all peer'>{`${window.location.href}location/${roomInfo.roomId}`}</p>
                      <span className='cursor-pointer p-2 rounded-full  hover:bg-gray-200 flex items-center active:animate-ping' onClick={() => {
                        const url = `${window.location.href}location/${roomInfo.roomId}`
                        navigator.clipboard.writeText(url).then(() =>{
                          toast.success('Copied to clipboard!', {
                            autoClose: 2000,
                          })
                        }).catch(() => {
                          toast.error('Failed to copy to clipboard', {
                            autoClose: 2000,
                          })
                        })
                      }}>
                        <LuCopy size=  {16}/>
                      </span>
                    </div>

                    <div className='flex p-2 bg-yellow-400 rounded-md'>
                      <span className='flex gap-1 items-center'>
                        <p className='text-lg font-semibold text-blue-600'>{3}</p>
                        <p className='text-md font-semibold'>connected users!</p>
                      </span>
                    </div>
                  </>
                  )
              }
            </article>
            {
              socketStatus === 'connected' &&  roomInfo && (
              <article className='w-full flex justify-center'>
                <div>
                  <button className='bg-red-600 text-xl text-white font-bold py-2 px-6 rounded-full' onClick={stopSharingLocation}>Stop Sharing</button>
                </div>
              </article>
              )
            }
          </div>
            {
              position && (
                <article className='bg-gray-200 rounded-md overflow-hidden w-full'>
                  <Map location={position}/>
                </article>
              )
            }
        </section>
      </div>
    </div>
  )
}
