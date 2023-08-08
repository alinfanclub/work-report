import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getReportDataDetail } from "../api/firestore";
import { HotTable } from "@handsontable/react";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";

export default function ViewReport() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const param = useParams().id;
  useEffect(() => {
    getReportDataDetail(param).then((data) => {
      setData(JSON.parse(data.data));
      setHeaders(data.headers);
      setTitle(data.title);
      setCreatedAt(String(data.createdAt));
    });
  }, [param]);
  return (
    <div className="grow-[1] flex flex-col gap-4 p-4">
      <h1 className="flex gap-4 items-end">
        {title && title}
        <small>{createdAt && createdAt}</small>
      </h1>

      <HotTable
        id="hot"
        data={data && data}
        colHeaders={headers && headers}
        rowHeaders={true}
        manualColumnMove={true}
        fixedColumnsStart={1}
        colWidths={200}
        wrowHeights={40}
        licenseKey="non-commercial-and-evaluation"
        readOnly={true}
        // for non-commercial use only
      />

      <div className="flex gap-4">
        {data.length > 0 && headers.length > 0 && (
          <CSVLink
            data={data}
            headers={headers}
            filename={`${title}.csv`}
            className="btn_default"
          >
            Export CSV
          </CSVLink>
        )}
        <Link to={`/reports/${param}/fix`} className="btn_default">
          fix
        </Link>
      </div>
    </div>
  );
}
