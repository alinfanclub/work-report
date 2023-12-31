import React, { useRef, useState } from "react";
import { useParams } from "react-router";
import { deleteReport, getReportDataDetail } from "../api/firestore";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatAgo } from "../utill/timeago";
import {
  timeStampFormat,
  timeStampFormatNotHour,
} from "../utill/timeStampFormat";
import HotTableOption from "../service/HotTableOption";
import { MdDeleteOutline } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
export default function ViewReport() {
  const [headers, setHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [title, setTitle] = useState("");

  const param = useParams().id;
  const hotRef = useRef(null);

  const {
    isLoading,
    isError,
    data: queryData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        setTableData(JSON.parse(data.data).slice(1));
        setHeaders(JSON.parse(data.data)[0]);
        setTitle(data.title);
        return data;
      }),
  });

  //scrollViewportTo
  const scrollToBottom = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(hot.countRows() - 1, hot.countCols() - 1);
  };

  const scrollToTop = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(0, 0);
  };

  const handleDelete = async () => {
    if (window.confirm("삭제하시겠습니까?")) {
      await deleteReport(param).then(() => {
        window.location.href = "/";
      });
    } else {
      return false;
    }
  };

  return (
    <div className="w-full min-h-screen">
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
      {queryData && (
        <div className="grow flex flex-col gap-4 p-4 w-full">
          <div className="flex justify-between w-full items-start xl:items-center">
            <h1 className="flex gap-4 xl:items-end flex-col xl:flex-row ">
              {title && title}
              <div className="flex gap-2">
                <small>{timeStampFormat(queryData.createdAt)}</small>
                <small>
                  {formatAgo(timeStampFormat(queryData.createdAt), "ko")}
                </small>
                {queryData.fix && <small>수정됨</small>}
              </div>
            </h1>
            <div className="flex gap-4 items-center">
              <Link to={`/reports/${param}/fix`} className="text-xl">
                <BsPencilSquare />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete()}
                className="text-2xl "
              >
                <MdDeleteOutline />
              </button>
            </div>
          </div>
          <div className="h-[170vw] xl:h-[86vh] w-full overflow-hidden reportTable relative">
            <HotTableOption
              queryData={queryData}
              tableData={tableData}
              hotRef={hotRef}
              colHeaders={headers}
              readOnly={true}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-4">
              {tableData.length > 0 && (
                <CSVLink
                  data={tableData}
                  headers={headers}
                  filename={`${title}_${timeStampFormatNotHour(
                    queryData.createdAt
                  )}.csv`}
                  className="btn_default"
                  onClick={() => {
                    if (window.confirm("CSV 파일을 다운로드 하시겠습니까?")) {
                      setTimeout(() => {
                        this.csvLink.current.link.click();
                      });
                    } else {
                      return false;
                    }
                  }}
                >
                  Export CSV
                </CSVLink>
              )}
              {/* <button className="btn_default" onClick={exportToXLSX}>
              Export XLSX
            </button> */}
            </div>
            <div className="flex gap-2">
              <div onClick={() => scrollToTop()}>위로</div>
              <div onClick={() => scrollToBottom()} className="">
                아래로
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
