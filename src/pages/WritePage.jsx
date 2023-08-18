import { HotTable } from "@handsontable/react";
import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { addReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate } from "react-router";
import * as XLSX from "xlsx";

export default function WritePage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  let hot;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  // eslint-disable-next-line
  // eslint-disable-next-line
  const [data, setData] = useState();
  const [addXelx, setAddXelx] = useState(false);
  const [addCSV, setAddCSV] = useState(false);

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
    await addReport(data, user, title).then(() => {
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
        setData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // const handleOnDrop = (e, setState, csvObject) => {
  //   e.preventDefault();

  //   let file = e.dataTransfer.files[0];
  //   let fileReader = new FileReader();

  //   fileReader.readAsText(file, "utf-8"); // or euc-kr

  //   fileReader.onload = function () {
  //     //console.log(fileReader.result);
  //     parsingCsv(fileReader.result, csvObject);
  //     return;
  //   };

  //   setState(false);
  //   return false;
  // };

  // const handleUpload = (e, csvObject) => {
  //   let file = e.target.files[0];
  //   let fileReader = new FileReader();

  //   if (file === undefined) return; /* 방어 코드 추가 */

  //   fileReader.readAsText(file, "utf-8"); // or euc-kr

  //   fileReader.onload = function () {
  //     //console.log(fileReader.result);
  //     parsingCsv(fileReader.result, csvObject);
  //   };
  // };

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
    setData(obj);
    return;
  };

  const exclude = () => {
    const handsontableInstance = hotRef.current.hotInstance;
    const lastRowIndex = handsontableInstance.countRows() - 1;

    // after each sorting, take row 1 and change its index to 0
    handsontableInstance.rowIndexMapper.moveIndexes(
      handsontableInstance.toVisualRow(0),
      0
    );
    // after each sorting, take row 16 and change its index to 15
    handsontableInstance.rowIndexMapper.moveIndexes(
      handsontableInstance.toVisualRow(lastRowIndex),
      lastRowIndex
    );
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
          <div></div>
        </div>
        <div className="h-[74vh] w-[87vw] overflow-hidden">
          <HotTable
            id="hot"
            data={data && data}
            contextMenu={true}
            // colHeaders={headers}
            colHeaders={true}
            rowHeaders={true}
            manualColumnMove={true}
            fixedColumnsStart={1}
            licenseKey="non-commercial-and-evaluation"
            ref={hotRef}
            colWidths={`${window.innerWidth - 300}` / 7}
            rowHeights={`${window.innerHeight - 300}` / 10}
            //headers length 만큼  columns={[]}안에 {} 생성
            manualColumnResize={true}
            dropdownMenu={true}
            columnSorting={true}
            className="htCenter htMiddle"
            afterColumnSort={exclude}
            // for non-commercial use only
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn_default">
            save
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
