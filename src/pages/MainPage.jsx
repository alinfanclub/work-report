import React, { useEffect, useState } from "react";
import { getReportData } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { Link } from "react-router-dom";

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);
  useEffect(() => {
    user &&
      getReportData(user).then((data) => {
        console.log(data);
        setReports(data);
      });
  }, [user]);
  return (
    <div className="grow-[1] p-4">
      <div className="flex gap-4">
        {reports.map((report) => (
          <Link
            className="border w-[100px] h-[100px] flex items-center justify-center rounded-2xl"
            to={`reports/${report.reportId}`}
            key={report.reportId}
          >
            {report.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
