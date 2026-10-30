import { Outlet } from 'react-router-dom'
import './App.css'
import Navi from './components/navbar/Navi'
import { useSelector } from 'react-redux'
import Homepage from './components/Home/Home.jsx'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'

function App() {
  let token=useSelector((state)=>state.uReducer.token)

  return (
    <div>
      <Navi></Navi>
      {!token && <Login></Login>}
      {token && <Outlet></Outlet>}
    </div>
  )
}

export default App
