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
            fixedColumnsStart={document.body.clientWidth > 1024 ? 1 : null}
            licenseKey="non-commercial-and-evaluation"
            ref={hotRef}
            colWidths={
              document.body.clientWidth > 1024
                ? document.body.clientWidth / 7
                : (document.body.clientWidth / 3)
            }
            rowHeights={`${window.innerHeight - 200}` / 10}
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
          <label
            className="btn_default"
            type="button"
            htmlFor="file"
          >{`엑셀, csv 파일 업로드`}
          <input
          type="file"
          id="file"
          accept=".xlsx, .csv"
          onChange={(e) => handleFileUpload(e)}
          className="mt-4 hidden "
        /></label>
        </div>
      </form>
    </div>
  );
}
