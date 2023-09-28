import { Outlet } from 'react-router-dom'
import Header from '../Elements/Header'

function index() {
  return (
    <div className='flex justify-center px-3 py-2'>
      <div className='flex flex-col w-full md:min-w-full xl:min-w-[1100px] xl:max-w-[1200px] mb-4'>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default index