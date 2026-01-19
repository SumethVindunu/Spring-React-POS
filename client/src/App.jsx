import Menubar from "./components/menubar/Menubar.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import { Routes, Route } from "react-router-dom"
import ManageCategory from "./pages/ManageCategory/ManageCategory.jsx";
import ManageUsers from "./pages/ManageUsers/ManageUsers.jsx";
import ManageItems from "./pages/ManageItems/ManageItems.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import {ToastContainer} from "react-toastify";
import configaration from "./assets/configaration.js";

function App() {


  return (
    <div>
        <Menubar/>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme={configaration.theme ? "dark" : "light"}
        />
        <Routes>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/category" element={<ManageCategory/>}/>
            <Route path="/users" element={<ManageUsers/>}/>
            <Route path="/items" element={<ManageItems/>}/>
            <Route path="/explore" element={<Explore/>}/>
            <Route path="/" element={<Dashboard/>}/>
        </Routes>

    </div>
  )
}

export default App


