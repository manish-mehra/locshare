import { Outlet } from 'react-router-dom'
import Header from '../Header'

function index() {
  return (
    <div className='flex justify-center p-3'>
      <div className='flex flex-col md:min-w-full xl:min-w-[1100px] xl:max-w-[1200px] mb-4'>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default index