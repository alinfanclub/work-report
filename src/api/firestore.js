import { db } from "./firebase";
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { v1 as uuidv1 } from 'uuid';

export async function createUser(user) {
  await setDoc(doc(db, "account", user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
  });
}

export async function addReport(headers, data, user, title) {
  const reportId = uuidv1();
  await setDoc(doc(db, "reports", reportId), {
    headers: headers,
    data: data,
    userId: user.uid,
    createdAt: new Date(),
    title: title,
    reportId: reportId,
  })
}

export async function getUserDate(user) {
  const q = query(
    collection(db, "account"),
    where("username", "==", user.email)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
}

export async function getReportData(user) {
  const q = query(
    collection(db, "reports"),
    where("userId", "==", user.uid)
  );

  const querySnapshot = await getDocs(q);
  let data = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    data.push(doc.data());
  });
  return data;
}

export async function getReportDataDetail(params) {
  const q = query(
    collection(db, "reports"),
    where("reportId", "==", params)
  );
  const querySnapshot = await getDocs(q);
  let data;
  querySnapshot.forEach((doc) => {
    data = (Object(doc.data()));
    console.log(data)
  });
  return data;
}