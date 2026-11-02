import { Outlet, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Navi from './components/navbar/Navi'
import { useSelector } from 'react-redux'

function App() {
const location = useLocation()
let token = useSelector((state) => state.uReducer.token)

return ( <div> <Navi />


  {!token && location.pathname.startsWith('/home') && <Navigate to="/" />}
  {!token && !location.pathname.startsWith('/home') && <Outlet />}
  {token && <Outlet />}
</div>


)
}

export default App
