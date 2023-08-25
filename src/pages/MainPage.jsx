import React, { useEffect, useState } from "react";
import { getReportData } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate } from "react-router-dom";
import { formatAgo } from "../utill/timeago";
import { timeStampFormat } from "../utill/timeStampFormat";

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

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

  const handleMoveToReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };
  return (
    <div className="w-full relative min-h-screen xl:h-screen p-4 xl:p-10">
      <div className="flex gap-8 mx-auto w-fit flex-col items-center">
        <h1>{user && user.displayName}</h1>
        <table className="">
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {reports
              .sort((a, b) => a.createdAt - b.createdAt)
              .map((report, index) => (
                <tr
                  key={report.reportId}
                  onClick={() => handleMoveToReport(report.reportId)}
                  className="cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <td>{index + 1}</td>
                  <td>{report.title}</td>
                  <td>
                    <div className="flex gap-2">
                      <small>{timeStampFormat(report.createdAt)}</small>
                      {window.innerWidth > 1024 && (
                        <small>
                          {formatAgo(timeStampFormat(report.createdAt), "ko")}
                        </small>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
