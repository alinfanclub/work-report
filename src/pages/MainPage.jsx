import React, { useEffect, useState } from "react";
import { getReportData } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { Link } from "react-router-dom";
import { formatAgo } from "../utill/timeago";
import timeStampFormat from "../utill/timeStampFormat";

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
        <table>
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
                <tr key={report.reportId}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`reports/${report.reportId}`}>
                      {report.title}
                    </Link>
                  </td>
                  <td>
                    <small>{timeStampFormat(report.createdAt)}</small>
                    <small>
                      {formatAgo(timeStampFormat(report.createdAt), "ko")}
                    </small>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
