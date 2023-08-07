import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      if (!email) {
        setError("이메일을 입력해주세요");
      } else if (!password) {
        setError("비밀번호를 입력해주세요");
      } else {
        setError("이메일 또는 비밀번호가 일치하지 않습니다");
      }
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
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
      <div>구글로 로그인</div>
      {error && <span>{error}</span>}
    </div>
  );
}
