import {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import {useSocket} from '../context/socket'
import Status from '../components/Elements/Status'
import Map from '../components/Elements/Map'
import StatusPanel from '../components/Elements/StatusPanel'
import { SocketStatus, GeolocationPosition } from '../types'
import {BsFillArrowLeftCircleFill} from 'react-icons/bs'

type RoomStatus = 'unknown' | 'joined' | 'not-exist'

function Location() {
  const { roomId } = useParams()
  const { socket, connectSocket } = useSocket()
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected')
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('unknown')
  const [position, setPosition] = useState<GeolocationPosition | null>(null)

  useEffect(() => {
    connectSocket()
    setSocketStatus('connecting')
    return () => {
      if(socket) {
        socket.disconnect()
        setSocketStatus('disconnected')
      }
    }
  }, [])

  useEffect(() => {

    if(socket){      
      
      socket.on('connect', () => {
        setSocketStatus('connected')
        socket.emit('joinRoom', {
          roomId
        })
      })

      socket.on('roomJoined', ({status}: {status: string}) => {
        if(status === 'OK') {
          setRoomStatus('joined')
        } else if (status === 'ERROR') {
          setRoomStatus('not-exist')
        } else {
          setRoomStatus('unknown')
        }
      })

      socket.on('updateLocationResponse', ({position}:{position: GeolocationPosition}) => {
        if(position) {
          setPosition(position)
        }
      })

      socket.on('roomDestroyed', () => {
        setRoomStatus('not-exist')
        socket.disconnect()
      })
          
      socket.on('disconnect', () => {
        setSocketStatus('disconnected')
      })
    }

  }, [socket])

  return (
    <>
      <section className='pb-3'>
        <article className='bg-slate-600 rounded-md p-3 flex flex-wrap gap-3 justify-between items-center w-full'>
          <Status locationStatus = {null} socketStatus={socketStatus}/>
          {
            position && (
              <div className='flex gap-2 justify-end text-gray-200'>
                <p className='font-bold text-sm'>Lat: <span className='text-lg font-bold'>{position.lat} | </span></p>
                <p className='font-bold text-sm'>Lng: <span className='text-lg font-bold'>{position.lng}</span></p>
              </div>
            )
            }
        </article>
      </section>
      {
        roomStatus === 'joined' && (
          <section>
            {
              position && (
                <div className='bg-gray-200 rounded-md overflow-hidden'>
                  <Map location={position}/>
                </div>
              )
            }
          </section>
        )
      }
      <section className='pb-3'>
        {
          socketStatus === 'connecting' && (
            <article className='mt-5'>
              <StatusPanel 
                title = "Connecting to server" 
                subtitle = "Please wait..."
                status = "loading"
              />
            </article>
          )
        }
        {
          socketStatus === 'error' && (
            <article className='mt-5'>
              <StatusPanel 
                title = "Failed to connect to server" 
                subtitle = "Please try again later" 
                status = "error"
                />
            </article>
          )
        }
        
        {
          socketStatus !== 'connecting' && roomStatus === 'unknown' && (
            <article className='mt-5'>
              <StatusPanel
                title = "Room is unknown"
                subtitle = "Please try again later"
                status = "error"
              /> 
            </article>
          )
        }
        
        {
          roomStatus === 'not-exist' && (
            <article className='mt-5'>
              <StatusPanel
                title = "Room doesn't exist"
                subtitle = "Enter the correct url"
                status = "error"
              />
            </article>
          )
        }
        {
          roomStatus !== 'joined' && (
            <article className='text-white flex items-center gap-2'>
              <BsFillArrowLeftCircleFill size={20} className='cursor-pointer' onClick={() => window.open('/', '_self')}/>
              <p className='text-md font-semibold'>Back</p>
            </article>
          )
        }
      </section>
    </>
  )
}

export default Location