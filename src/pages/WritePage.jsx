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
  // eslint-disable-next-line
  const [headers, setHeaders] = useState(null);
  // eslint-disable-next-line
  const [data, setData] = useState();
  const [addXelx, setAddXelx] = useState(false);
  const [useTemplete, setUseTemplete] = useState(false);
  const [addCSV, setAddCSV] = useState(false);

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const addRow = () => {
    const newRow = new Array(headers.length).fill("");
    hot = hotRef.current.hotInstance;
    hot.alter("insert_row_below", hot.countRows(), 1, newRow);
  };

  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log({ data: JSON.stringify(hot.getData()) });
    let data = JSON.stringify(hot.getData());
    await addReport(headers, data, user, title).then(() => {
      setTitle("");
      navigate("/");
    });
  };

  const DELIMITER = ",";
  const APOSTROPHE = '"';

  const fileUpload = (e) => {
    e.preventDefault();
    let file = e.target.files[0];
    if (file === undefined) return;
    let fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      // setData(e.target.result);
      parsingCsv(fileReader.result);

      console.log(fileReader.result);
    };
  };

  //
  //
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        setHeaders(jsonData[0]);
        setData(jsonData.slice(1));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const mySplit = (line, delimiter, ignore) => {
    let spt = [];
    let tmp = "";
    let flag = false;

    for (let i = 0; i < line.length; i++) {
      if (ignore === line[i] && flag === true) {
        flag = false;
        continue;
      } else if (ignore === line[i]) {
        flag = true;
        continue;
      }

      if (line[i] === delimiter && flag === false) {
        spt.push(tmp);
        tmp = "";

        continue;
      }

      tmp += line[i];
    }

    spt.push(tmp);

    return spt;
  };

  const parsingCsv = (file) => {
    let obj = [];

    let sptLine = file.split(/\r\n|\n/);
    console.log(sptLine);

    for (let line of sptLine) {
      if (line === "") continue;

      let spt = mySplit(line, DELIMITER, APOSTROPHE);
      console.log(spt);
      obj.push(spt);
    }
    const objHeaders = obj[0];
    const objData = obj.slice(1);
    setHeaders(objHeaders);
    setData(objData);
    return;
  };

  const hadleuseTemplete = () => {
    if (!useTemplete) {
      setData([
        ["날짜",
        "분류",
        "요청자",
        "내용",
        "작업자",
        "전달방식",
        "관련 파일명"], [], [], [], []
      ]);
      setUseTemplete(true);
    } else {
      setHeaders();
      setUseTemplete(false);
      setData()
    }
  };

  return (
    <div className="grow-[1] p-4">
      <form
        onSubmit={(...arg) => saveClickCallback(...arg)}
        className="flex flex-col gap-4 items-start "
      >
        <div className="flex w-full gap-2 items-end">
          <input
            type="text"
            placeholder="제목"
            onChange={(e) => setTitle(e.target.value)}
            required
            className=" max-w-[300px] "
          />
          <div>
            <input
              type="checkbox"
              id="useTemplete"
              className="hidden"
              onChange={() => hadleuseTemplete()}
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
        <div className="h-[74vh] w-[87vw] overflow-hidden  reportTable relative">
          <HotTableOption  colHeaders={headers ? headers : true} data={data} />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn_default">
            save
          </button>

          <button onClick={addRow} type="button" className="btn_default">
            addRow
          </button>
          <button
            className="btn_default"
            onClick={() => setAddXelx(!addXelx)}
            type="button"
          >{`엑셀 파일 업로드`}</button>
          <button
            className="btn_default"
            onClick={() => setAddCSV(!addCSV)}
            type="button"
          >{`CSV 파일 업로드`}</button>
        </div>
      </form>
      {addXelx && (
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => handleFileUpload(e)}
          className="mt-4"
        />
      )}
      {addCSV && (
        <input
          type="file"
          accept=".csv"
          onChange={(e) => fileUpload(e)}
          className="mt-4"
        />
      )}
    </div>
  );
}
