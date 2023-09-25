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
  <div className='flex justify-center'>
    <div className='flex flex-col md:min-w-[900px] md:max-w-[1200px] p-2 mb-5'>
        <section className='pt-3'>
          <Header />
        </section>
        <section>
          <Status locationStatus = {null} socketStatus={socketStatus}/>
        </section>

        {
          socketStatus === 'error' && (
            <section>
              <div className='flex flex-col gap-2 items-start mb-5'>
                <p className='text-lg text-gray-800 font-semibold'>Failed to connect to server</p>
                <p className='text-sm text-gray-600'>Please try again later</p>
              </div>
            </section>
          )
        }
          
        {
          socketStatus === 'connected' && (
          <React.Fragment>
            {
              roomStatus === 'unknown' && (
                <section>
                  <p>checking room status</p>
                </section>
              )
            }
            
            {
              roomStatus === 'joined' && (
                <section>
                   <p className='text-xs font-semibold text-black'>location accessed</p>
                  {
                    position && (
                      <section className='bg-gray-200 rounded-md overflow-hidden'>
                        <div className=''>
                          <Map location={position}/>
                        </div>
                      </section>
                    )
                  }
                </section>
              )
            }

            {
              roomStatus === 'not-exist' && (
                <section>
                  <p>room doesnt exist</p>
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