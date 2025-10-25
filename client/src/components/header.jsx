import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

function Header() {
  const navigate = useNavigate()
  const baseurl = import.meta.env.VITE_BASE_URL

  const handleLogout = async () => {
    try {
      await axios.post(`${baseurl}/api/logout`, {}, { withCredentials: true })
      toast.success('Logged out')
      navigate('/')
    } catch (err) {
      console.error('logout error', err)
      toast.error(err?.response?.data?.message || 'Logout failed')
    }
  }

  return (
    <div className='w-full p-2.5'>
      <div className='max-w-6xl mx-auto flex items-center justify-between'>
        <div className='h-16 bg-[#EFD6AC] flex items-center justify-center px-4 rounded-full'>
          <div className='text-white text-lg font-semibold'>
            <p className='subpixel-antialiased text-[#432534] font-light text-3xl p-3'>Book Inventory</p>
          </div>
        </div>

        <div>
          <button onClick={handleLogout} className='px-3 py-2 rounded bg-[#432534] text-white hover:opacity-90'>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Header