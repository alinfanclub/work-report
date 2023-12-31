import { db } from "./firebase";
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { v1 as uuidv1 } from "uuid";

export async function createUser(user) {
  await setDoc(doc(db, "account", user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
  });
}

export async function getUserDate(user) {
  const q = query(
    collection(db, "account"),
    where("username", "==", user.email)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " =>", doc.data());
  });
}

export async function getReportData(user) {
  const q = query(collection(db, "reports"), where("userId", "==", user.uid));

  const querySnapshot = await getDocs(q);
  let data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

export async function getReportDataDetail(params) {
  const q = query(collection(db, "reports"), where("reportId", "==", params));
  const querySnapshot = await getDocs(q);
  let data;
  querySnapshot.forEach((doc) => {
    data = Object(doc.data());
  });
  return data;
}

export async function addReport(data, user, title) {
  const reportId = uuidv1();
  await setDoc(doc(db, "reports", reportId), {
    data: data,
    userId: user.uid,
    createdAt: serverTimestamp(),
    title: title,
    reportId: reportId,
    fix: false,
    writer: user.displayName,
  });

  return reportId;
}

export async function updateReport(data, title, reportId) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    title: title,
    data: data,
    fix: true,
    createdAt: serverTimestamp(),
  });
}

export async function deleteReport(reportId) {
  await deleteDoc(doc(db, "reports", reportId));
}
