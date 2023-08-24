import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { loginGoogle, onUserStateChanged } from "../api/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onUserStateChanged((user) => {
      if (user) {
        navigate("/");
      }
    });
  }, [navigate]);

  const auth = getAuth();

  const loginEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handelLogin = async (e) => {
    e.preventDefault();
    try {
      await loginEmail(email, password);
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setError("유효하지 않은 이메일입니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
        case "auth/user-disabled":
          setError("사용이 정지된 계정입니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
        case "auth/user-not-found":
          setError("사용자를 찾을 수 없습니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
        case "auth/wrong-password":
          setError("비밀번호가 틀렸습니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
        default:
          setError("로그인에 실패했습니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      loginGoogle();
      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/account-exists-with-different-credential":
          setError("이미 사용중인 이메일입니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;

        default:
          setError("로그인에 실패했습니다.");
          setTimeout(() => {
            setError(null);
          }, 3000);
          break;
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4 w-screen">
      <form onSubmit={handelLogin}>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn_default">
            로그인
          </button>
        </div>
      </form>
      <Link to="/join">회원가입</Link>
      <div onClick={handleGoogleLogin} className=" cursor-pointer">
        구글로 로그인
      </div>
      {error && <span>{error}</span>}
    </div>
  );
}
