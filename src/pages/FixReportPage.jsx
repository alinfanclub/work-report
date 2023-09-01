import React, { useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { getReportDataDetail, updateReport } from "../api/firestore";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { timeStampFormat } from "../utill/timeStampFormat";
import HotTableOption from "../service/HotTableOption";

export default function FixReportPage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams().id;
  let hot;
  const [tableData, setTableData] = useState([]);
  const [title, setTitle] = useState("");

  const {
    isLoading,
    isError,
    data: queryData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        setTableData(
          data.headers
            ? Array(data.headers).concat(JSON.parse(data.data)).slice(1)
            : JSON.parse(data.data)
        );
        setTitle(data.title);
        console.log(Array(data.headers).concat(JSON.parse(data.data)));
        return data;
      }),
    refetchOnWindowFocus: false,
  });
  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log({ data: JSON.stringify(hot.getData()) });
    let data = JSON.stringify(hot.getData());
    await updateReport(data, title, param).then(() => {
      setTitle("");
      navigate(`/reports/${param}`);
    });
  };

  //scrollViewportTo
  const scrollToBottom = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(hot.countRows() - 1, hot.countCols() - 1);
    // hot.scrollViewportTo(0,0);
  };

  const scrollToTop = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(0, 0);
    // hot.scrollViewportTo(0,0);
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
        <form onSubmit={(...arg) => saveClickCallback(...arg)}>
          <div className="flex flex-col gap-2 grow p-4 xl:w-full w-screen">
            <div className="flex gap-2 w-full flex-col xl:flex-row items-start xl:items-end">
              <input
                type="text"
                placeholder="제목"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                className="max-w-[300px]"
                required
              />
              <small>{timeStampFormat(queryData.createdAt)}</small>
            </div>
            <div className="h-[170vw] xl:h-[86vh] w-full overflow-hidden reportTable relative">
              <HotTableOption
                queryData={queryData}
                tableData={tableData}
                hotRef={hotRef}
                colHeaders={true}
              />
            </div>
            <div className="flex jusitify-start items-center w-full gap-4">
              <div className="flex gap-4">
                <button type="submit" className="btn_default">
                  save
                </button>
                {/* <button onClick={addRow} type="button" className="btn_default">
              addRow
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
        </form>
      )}
    </div>
  );
}
