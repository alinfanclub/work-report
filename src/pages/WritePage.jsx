import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { addReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate } from "react-router";
import { AiFillCheckSquare, AiOutlineCheckSquare } from "react-icons/ai";
import * as XLSX from "xlsx";
import HotTableOption from "../service/HotTableOption";

export default function WritePage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  let hot;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [data, setData] = useState();
  const [useTemplete, setUseTemplete] = useState(false);

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  // const addRow = () => {
  //   const newRow = new Array(headers.length).fill("");
  //   hot = hotRef.current.hotInstance;
  //   hot.alter("insert_row_below", hot.countRows(), 1, newRow);
  // };

  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log(hot.getData());
    let data = JSON.stringify(hot.getData());
    await addReport(data, user, title).then((reportId) => {
      setTitle("");
      navigate(`/reports/${reportId}`);
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
      };
    }
  };

  const hadleuseTemplete = () => {
    hot = hotRef.current.hotInstance;
    const data = hot.getData();
    if (!useTemplete) {
      if (window.confirm("템플릿을 사용하겠습니까?")) {
        const templete = [
          "날짜",
          "분류",
          "요청자",
          "내용",
          "작업자",
          "전달방식",
          "관련 파일명",
        ];
        console.log(Array(templete).concat(data));
        setData(Array(templete).concat(data));
        setUseTemplete(true);
      }
    } else {
      if (window.confirm("템플릿을 사용 취소 하겠습니까?")) {
        setData(data.slice(1));
        setUseTemplete(false);
      }
    }
  };
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <div className="w-full">
      <form onSubmit={(...arg) => saveClickCallback(...arg)}>
        <div className="flex flex-col gap-2 grow p-4 xl:w-full w-screen">
          <div className="flex gap-2 w-full flex-col xl:flex-row items-start xl:items-end">
            <input
              type="text"
              placeholder="제목"
              onChange={handleTitleChange}
              required
              className=" max-w-[300px] "
            />
            <div>
              <input
                type="checkbox"
                id="useTemplete"
                className="hidden"
                onChange={hadleuseTemplete}
              />
              <label htmlFor="useTemplete" className="flex items-center gap-2">
                <p>템플릿 사용</p>
                {useTemplete ? (
                  <AiFillCheckSquare className="text-blue-700" />
                ) : (
                  <AiOutlineCheckSquare />
                )}
              </label>
            </div>
          </div>
          <div className="min-h-[120vw] xl:min-h-[30vw] w-full  overflow-hidden reportTable relative">
            <HotTableOption colHeaders={true} data={data} hotRef={hotRef} />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn_default">
              save
            </button>
            <label
              className="btn_default"
              htmlFor="fileUploadButton"
              type="button"
            >{`엑셀 파일 업로드`}</label>
            <input
              type="file"
              accept=".xlsx, .csv"
              onChange={(e) => handleFileUpload(e)}
              className="mt-4 hidden"
              id="fileUploadButton"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
