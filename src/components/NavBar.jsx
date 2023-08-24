import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { logout, onUserStateChanged } from "../api/firebase";
import Avvvatars from "avvvatars-react";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [menunOpen, setMenunOpen] = useState(false);
  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);
  return (
    <header
      className={`fixed z-[9999] top-0 ${
        menunOpen ? "left-0" : "-left-full"
      } transition-all xl:relative xl:left-0 xl:top-0 xl:transition-none xl:z-0`}
    >
      <nav className=" flex flex-col min-w-[200px] w-full gap-10 bg-blue-500 items-center  py-10 text-white h-screen z-[9999] px-4">
        <div className="flex flex-col gap-4 items-center">
          <div className="mb-10">
            <Link to="/" onClick={() => setMenunOpen(!menunOpen)}>
              My Report Project
            </Link>
          </div>

          <Link to="/" onClick={() => setMenunOpen(!menunOpen)}>
            Home
          </Link>
          <Link to="/write" onClick={() => setMenunOpen(!menunOpen)}>
            write
          </Link>
        </div>
        {user && (
          <div className="flex flex-col justify-center items-center gap-4 bg-blue-400 w-full p-4 rounded-2xl">
            {!user.photoURL ? (
              <Avvvatars value={user.email} style={`shape`} />
            ) : (
              <img
                src={user.photoURL}
                alt=""
                className="w-16 h-16 rounded-full"
              />
            )}
            <p>{user.displayName}</p>
            <button className="" onClick={logout}>
              logout
            </button>
          </div>
        )}
      </nav>
      <div
        className="fixed bottom-10 right-10 xl:hidden z-[9999]"
        onClick={() => setMenunOpen(!menunOpen)}
      >
        menun
      </div>
    </header>
  );
}
