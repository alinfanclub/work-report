import React, { useState } from "react";
import { useParams } from "react-router";
import { getReportDataDetail } from "../api/firestore";
import { HotTable } from "@handsontable/react";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function ViewReport() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const param = useParams().id;
  const {
    isLoading,
    isError,
    data: tableData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        setData(JSON.parse(data.data));
        setHeaders(data.headers);
        setTitle(data.title);
        return data;
      }),
  });
  return (
    <div>
      {isError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          에러가 발생했습니다.
        </div>
      )}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          로딩중...
        </div>
      )}
      {tableData && (
        <div className="grow-[1] flex flex-col gap-4 p-4">
          <h1 className="flex gap-4 items-end">
            {title && title}
            <small>{tableData.createdAt}</small>
            {tableData.fix && <small>수정됨</small>}
          </h1>
          <HotTable
            id="hot"
            data={data && data}
            colHeaders={headers && headers}
            rowHeaders={true}
            manualColumnMove={true}
            fixedColumnsStart={1}
            className="htCenter htMiddle"
            colWidths={`${window.innerWidth - 300}` / headers.length}
            rowHeights={`${window.innerHeight - 200}` / 5}
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
      )}
    </div>
  );
}
