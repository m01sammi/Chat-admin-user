import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Authorization from './pages/authorization/Authorization';
import { User } from './pages/user/User';
import { Admin } from './pages/admin/Admin';

function App() {
  return (
    <Routes>
    <Route path="" element={<Authorization />}/>
    <Route path="/user" element={<User />}/>
    <Route path="/admin" element={<Admin />}/>
  </Routes>
  );
}

export default App;
