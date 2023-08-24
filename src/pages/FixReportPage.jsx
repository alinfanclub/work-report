import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { getReportDataDetail, updateReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {timeStampFormat} from "../utill/timeStampFormat";
import HotTableOption from "../service/HotTableOption";

export default function FixReportPage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams().id;
  let hot;
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");

  const {
    isLoading,
    isError,
    data: tableData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        setData(data.headers ? Array(data.headers).concat(JSON.parse(data.data)).slice(1) : JSON.parse(data.data))
        setHeaders(data.headers ? data.headers : Array(data.headers).concat(JSON.parse(data.data))[0])
        setTitle(data.title);
        console.log(Array(data.headers).concat(JSON.parse(data.data)))
        return data;
      }),
      refetchOnWindowFocus: false,
  });

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);
  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log({ data: JSON.stringify(hot.getData()) });
    let data = JSON.stringify(hot.getData());
    setHeaders(data[0])
    await updateReport(headers, data, title, param).then(() => {
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
        <form
          onSubmit={(...arg) => saveClickCallback(...arg)}
          className="flex flex-col gap-4 grow-[1] p-4"
        >
          <div className="flex gap-2 items-end">
            <input
              type="text"
              placeholder="제목"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="max-w-[300px]"
              required
            />
            <small>{timeStampFormat(tableData.createdAt)}</small>
          </div>
          <div className="h-[86vh] w-[87vw] overflow-hidden reportTable relative">
            <HotTableOption tableData={tableData} data={data} hotRef={hotRef} colHeaders={true} />
          </div>
          <div className='flex justify-between'>
          <div className="flex gap-4">
            <button type="submit" className="btn_default">
              save
            </button>
            {/* <button onClick={addRow} type="button" className="btn_default">
              addRow
            </button> */}
          </div>
          <div className='flex gap-2'>
            <div onClick={() => scrollToTop()}>
              위로
            </div>
            <div onClick={() => scrollToBottom()} className="">
                아래로
            </div>
          </div>
          </div>
        </form>
      )}
    </div>
  );
}
