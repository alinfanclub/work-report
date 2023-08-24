import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { createUser } from "../api/firestore";
export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessages, setErrorMessages] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  // 파이어베이스에 이메일 회원가입
  const joinEmail = async (email, password) => {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(auth.currentUser, { displayName: userName });
    await createUser(user);
    return user;
  };

  // 회원가입 버튼 클릭
  const handleSignUp = async (e) => {
    // 기본 이벤트 막기
    e.preventDefault();
    // 파이어베이스에 회원가입 요청 보내기 (성공하면 로그인 페이지로 이동) (실패하면 에러 출력)
    try {
      await joinEmail(email, password);
      navigate("/login");
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessages("이미 사용중인 이메일입니다.");
          setTimeout(() => {
            setErrorMessages(null);
          }, 3000);
          break;
        case "auth/invalid-email":
          setErrorMessages("유효하지 않은 이메일입니다.");
          setTimeout(() => {
            setErrorMessages(null);
          }, 3000);
          break;
        case "auth/weak-password":
          setErrorMessages("비밀번호는 6자리 이상이어야 합니다.");
          setTimeout(() => {
            setErrorMessages(null);
          }, 3000);
          break;
        default:
          setErrorMessages("회원가입에 실패했습니다.");
          setTimeout(() => {
            setErrorMessages(null);
          }, 3000);
      }
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            name="userName"
            id="userName"
            placeholder="userName"
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`btn_default ${
              !email || !password || !userName ? "disabled" : ""
            }`}
          >
            회원가입
          </button>
          {errorMessages && <span>{errorMessages}</span>}
        </div>
      </form>
    </div>
  );
}
