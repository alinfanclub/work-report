import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { useEffect } from "react";
import { onUserStateChanged } from "./api/firebase";
import { useNavigate } from "react-router-dom";
import { getUserDate } from "./api/firestore";
function App() {
  const navigate = useNavigate();

  useEffect(() => {
    onUserStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        getUserDate(user);
      }
    });
  }, [navigate]);
  return (
    <div className="App w-full">
      <div
        id="container"
        className="xl:flex relative xl:justify-start w-screen xl:flex-row"
      >
        <NavBar />
        <Outlet />
      </div>
    </div>
  );
}

export default App;
