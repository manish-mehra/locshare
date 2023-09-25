import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import {useSocket} from '../context/socket'
import Header from '../components/Header'
import Status from '../components/Status'
import Map from '../components/Map'
import { SocketStatus, GeolocationPosition } from '../types'

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

      socket.on('roomJoined', (data:any) => {
        if(data.status === 'OK') {
          console.log('dataaa', data)
          setRoomStatus('joined')
        } else if (data.status === 'ERROR') {
          console.log(data)
          setRoomStatus('not-exist')
        }
      })

      socket.on('updateLocationResponse', (data:any) => {
        console.log('get location', data)
        setPosition({
          lat: data.position.lat,
          lng: data.position.lng
        })
      })
          
      socket.on('disconnect', () => {
        setSocketStatus('disconnected')
      })
    }

  }, [socket])

  return (
  <div className='flex justify-center p-3'>
    <div className='flex flex-col md:min-w-full xl:min-w-[1100px] xl:max-w-[1200px] mb-4'>
      <section className='pt-4 pb-20'>
        <Header/>
      </section>
      <section className='pb-2'>
        <div className='mb-4 bg-slate-600 rounded-md p-3 flex flex-wrap gap-3 justify-between items-center w-full'>
          <Status locationStatus = {null} socketStatus={socketStatus}/>
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

      {
        socketStatus === 'connecting' && (
          <section className='bg-red-400 mt-5 p-2 rounded-md animate-bounce'>
            <div className='flex flex-col gap-2 items-start mb-5'>
              <p className='text-lg text-white font-semibold'>Connecting to server</p>
              <p className='text-sm text-gray-100'>Please wait...</p>
            </div>
          </section>
        )
      }

      {
        socketStatus === 'error' && (
          <section className='bg-red-500 mt-5 p-2 rounded-md'>
            <div className='flex flex-col gap-2 items-start mb-5'>
              <p className='text-lg text-white font-semibold'>Failed to connect to server</p>
              <p className='text-sm text-white'>Please try again later</p>
            </div>
          </section>
        )
      }
          
        {
          socketStatus === 'connected' && (
          <React.Fragment>
            {
              roomStatus === 'unknown' && (
                <section className='bg-red-500 mt-5 p-2 rounded-md'>
                  <div className='flex flex-col gap-2 items-start mb-5'>
                    <p className='text-lg text-white font-semibold'>Room is unknown</p>
                    <p className='text-sm text-white'>Please try again later</p>
                  </div>
                </section>
              )
            }
            
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

            {
              roomStatus === 'not-exist' && (
                <section className='bg-red-500 mt-5 p-2 rounded-md'>
                  <div className='flex flex-col gap-2 items-start mb-5'>
                    <p className='text-lg text-white font-semibold'>Room doesn't exist!</p>
                    <p className='text-sm text-white'>Enter the correct url</p>
                  </div>
                </section>
              )
            }
          </React.Fragment> 
          )
        }
    </div>
  </div>
  )
}

export default Location