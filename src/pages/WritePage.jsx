import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { addReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate } from "react-router";
import { AiFillCheckSquare, AiOutlineCheckSquare } from "react-icons/ai";
import * as XLSX from "xlsx";
import HotTableOption from "../service/HotTableOption";
import { useSpeechRecognition } from "react-speech-recognition";
import SpeechRecognition from "react-speech-recognition/lib/SpeechRecognition";
import { BsRecord2 } from "react-icons/bs";

export default function WritePage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  let hot;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [tableData, setTableData] = useState();
  const [useTemplete, setUseTemplete] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const reportSave = async (e) => {
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
        setTableData(jsonData);
      };
    }
  };

  const hadleuseTemplete = () => {
    hot = hotRef.current.hotInstance;
    const data = hot.getData();
    if (!useTemplete && window.confirm("템플릿을 사용하겠습니까?")) {
      const templete = [
        "날짜",
        "분류",
        "요청자",
        "내용",
        "작업자",
        "전달방식",
        "관련 파일명",
      ];
      setTableData(Array(templete).concat(data));
      setUseTemplete(true);
    } else {
      if (window.confirm("템플릿을 사용 취소 하겠습니까?")) {
        setTableData(data.slice(1));
        setUseTemplete(false);
      }
    }
  };
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // 녹음 라이브러리 불러오기
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 녹음 자동 종료가 아니라 계속 녹음 되로록 설정
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });

  // 선택한 셀의 위치 정보를 저장하고 녹음 시작
  const startRecordingFromMenu = (key, selection, clickEvent) => {
    const startRow = selection[0].start.row;
    const startCol = selection[0].start.col;
    // console.log(clickEvent, clickEvent.x, clickEvent.y)
    // const stopModal = document.getElementById("stopModal");
    // stopModal.style.display = "fixed";
    // stopModal.style.top = `${document.querySelector("td.highlight").getBoundingClientRect().y}px`;
    // stopModal.style.left = `${document.querySelector("td.highlight").getBoundingClientRect().x + 200}px`;

    setSelectedCell({ row: startRow, col: startCol });
    startListening();
  };

  // 녹음 시작, 녹음 중지 메뉴 생성
  const contextMenuItems = {
    start_recording: {
      name: "녹음 시작",
      callback: startRecordingFromMenu,
    },
    stop_recording: {
      name: "녹음 중지",
      callback: SpeechRecognition.stopListening,
    },
  };

  // 리스닝에 따라 녹음 중지시 위치 정보 초기화 및 녹음 정보 초기화
  useEffect(() => {
    if (!listening && selectedCell && transcript) {
      setSelectedCell(null);
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript, selectedCell]);

  // transcript를 감지하여 녹음 중지시 녹음 정보를 선택한 셀에 저장
  useEffect(() => {
    if (selectedCell && transcript) {
      // eslint-disable-next-line
      hot = hotRef.current.hotInstance;
      hot.setDataAtCell(selectedCell.row, selectedCell.col, transcript);
    }
  }, [transcript]);

  return (
    <div className="w-full">
      <form onSubmit={reportSave}>
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
            <HotTableOption
              colHeaders={true}
              tableData={tableData}
              hotRef={hotRef}
              contextMenu={contextMenuItems}
            />
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
      {!browserSupportsSpeechRecognition ? (
        <span>Browser doesn't support speech recognition.</span>
      ) : (
        <div
          id="stopModal"
          className="fixed bottom-4 left-1/2 -translate-X-1/2"
        >
          {listening && (
            <div className="">
              <button
                onTouchEnd={SpeechRecognition.stopListening}
                onMouseUp={SpeechRecognition.stopListening}
              >
                <BsRecord2 className="text-red-500 xl:text-[5vw]" />
              </button>
              <p
                onClick={SpeechRecognition.stopListening}
                className="text-xl font-bold "
              >
                녹음 중지
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
