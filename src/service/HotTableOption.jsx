import { HotTable } from "@handsontable/react";
import React from "react";

export default function HotTableOption({
  queryData,
  tableData,
  hotRef,
  colHeaders,
  readOnly,
  afterSelection,
  contextMenu,
}) {
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

  // colWidth를 반환하는 함수
  const colWidths = () => {
    let colWidths = [];
    if (queryData) {
      if (window.innerWidth < 1024) {
        for (let i = 0; i < JSON.parse(queryData.data)[0].length; i++) {
          colWidths.push(100);
        }
        return colWidths;
      }
      for (let i = 0; i < JSON.parse(queryData.data)[0].length; i++) {
        colWidths.push(
          window.innerWidth / JSON.parse(queryData.data)[0].length
        );
      }
      return colWidths;
    } else {
      return (colWidths =
        window.innerWidth > 1024
          ? (window.innerWidth - 300) / 5
          : window.innerWidth / 5);
    }
  };

  return (
    <HotTable
      id="hot"
      data={tableData && tableData}
      colHeaders={colHeaders}
      rowHeaders={true}
      manualColumnMove={true}
      fixedColumnsStart={window.innerWidth > 1024 ? 1 : 0}
      className="htCenter htMiddle z-0"
      colWidths={colWidths()}
      rowHeights={`${(window.innerHeight - 200) / 10}`}
      licenseKey="non-commercial-and-evaluation"
      readOnly={readOnly ? readOnly : false}
      ref={hotRef}
      contextMenu={
        !contextMenu
          ? true
          : {
              items: {
                row_above: {}, // 기본 메뉴 항목
                row_below: {},
                col_left: {},
                col_right: {},
                remove_row: {},
                remove_col: {},
                undo: {},
                redo: {},
                make_read_only: {},
                alignment: {},
                start_recording: contextMenu["start_recording"],
                stop_recording: contextMenu["stop_recording"],
                "---------": {}, // 구분선 추가
                copy: {},
                cut: {},
                paste: {},
              },
            }
      }
      manualColumnResize={true}
      dropdownMenu={true}
      columnSorting={true}
      width={"100%"}
      afterColumnSort={exclude}
      afterSelection={afterSelection}
      // for non-commercial use only
    />
  );
}
