import {useState, useEffect} from 'react'
import {useSocket} from '../context/socket'

export default function Home() {
  const {socket, connectSocket} = useSocket()
  const [isConnected, setIsConnected] = useState<boolean>(false)

  console.log('socket from app', socket)

  useEffect(() => {
    if(socket) {
      socket.on('pong', () => {
        console.log('pong received')
      })

      socket.on('connect', () => {
        setIsConnected(true)
      })
      
      socket.on('disconnect', () => {
        setIsConnected(false)
      })
    }

  }, [socket])

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col md:min-w-[650px] p-2'>
        <section>
          <div className='mb-10 mt-10'>
            <h1 className='text-3xl text-gray-900 font-bold'>LocShare</h1>
            <h2 className='text-lg text-gray-800 font-semibold'>Real-Time Location Sharing, Made Easy</h2>
          </div>
          <div className='flex flex-wrap gap-2 items-start mb-5'>
            <button className='bg-green-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'>Share Location</button>
            <span className='flex gap-1'>
              <input type = "text" placeholder = "Enter a code or link" className='border border-blue-300 bg-gray-300 rounded-md p-2 outline-none ring-0 text-sm font-medium' />
              <button className='bg-yellow-400 text-sm text-gray-700 font-bold p-2 border border-blue-300 rounded-md'>Join</button>
            </span>
          </div>
        </section>

        <section className='mb-4 flex flex-col gap-2'>
          {/* <div className='p-3 border-2 border-blue-400 rounded-md'>
            <p className='text-xs font-semibold text-gray-200'>Connecting to server...</p>
          </div> */}
          <div className='p-3 border-2 border-blue-400 bg-green-400 rounded-md'>
            <p className='text-xs font-semibold text-black'>Connected</p>
          </div>
          {/* <div className='p-3 border-2 border-blue-400 rounded-md'>
            <p className='text-xs font-semibold text-gray-200'>Allow Location Permisson!!</p>
          </div>
          <div className='p-3 border-2 border-blue-400 bg-green-400 rounded-md'>
            <p className='text-xs font-semibold text-black'>Location Accessed</p>
          </div> */}
          <div className='p-3 border-2 border-blue-400 bg-red-400 rounded-md'>
            <p className='text-xs font-semibold text-black'>Location Denied</p>
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
