
type Props = {
  title: string
  subtitle: string,
  status: 'success' | 'error' | 'loading' | 'warning' | 'info'
}

const variants = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  info: 'bg-blue-500 text-white',
  loading: 'bg-purple-500 text-white animate-bounce'
}

function index({title, subtitle, status}: Props) {
  return (
    <div className = {`flex flex-col gap-2 items-start mb-5 p-2 rounded-md ${variants[status]}`}>
      <p className='text-lg font-semibold'>{title}</p>
      <p className='text-sm'>{subtitle}</p>
    </div>
  )
}

export default index