/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { Children, cloneElement, useEffect, useRef, useState } from 'react'
import Config from 'common/constants/config'
import { Button } from 'antd'

interface IProps {
  bordered?: boolean
  colorActive?: string
  isRowSelection?: boolean
  defaultSelection?: any[]
  onChangeSelect?: (data: any[]) => any
}

export interface IInputSplitArray {
  newArray: { [key: string]: any }[]
  mergeArray: { [key: string]: any }[]
  deleteArray: { [key: string]: any }[]
}

export const splitArray = (
  inputArray: { [key: string]: any }[],
  defaultArray: { [key: string]: any }[],
  key: string,
  getValueMerge: 'inputArray' | 'defaultArray' = 'inputArray'
): IInputSplitArray => {
  const result: IInputSplitArray = {
    newArray: [],
    mergeArray: [],
    deleteArray: []
  }

  const newArray = inputArray.filter((itemInputArr) => {
    return !defaultArray.find((itemDefaultArr) => itemDefaultArr[key] === itemInputArr[key])
  })

  const mergeArrayInput = inputArray.filter((itemInputArr) => {
    return defaultArray.find((itemDefaultArr) => itemDefaultArr[key] === itemInputArr[key])
  })

  const mergeArrayDefault = defaultArray.filter((itemDefaultArr) => {
    return inputArray.find((itemInputArr) => itemDefaultArr[key] === itemInputArr[key])
  })

  const deleteArray = defaultArray.filter((itemDefaultArr) => {
    return !mergeArrayInput.find((mergeArray) => itemDefaultArr[key] === mergeArray[key])
  })

  result.newArray = newArray
  result.mergeArray = getValueMerge === 'inputArray' ? mergeArrayInput : mergeArrayDefault
  result.deleteArray = deleteArray
  return result
}

const TableHoc: React.FC<IProps> = ({
  bordered,
  colorActive,
  children,
  defaultSelection,
  onChangeSelect,
  isRowSelection
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[] | number[]>([])
  const tableRef = useRef<HTMLDivElement>(null)
  console.log('jhu')

  const activeRow = (key: string, color: string = colorActive ? colorActive : '#f8f8f8') => {
    if (tableRef.current) {
      let trElement: any = tableRef.current.getElementsByTagName('tr')
      if (trElement && trElement.length >= 0) {
        for (let i = 0; i < trElement.length; i++) {
          if (trElement[i].hasAttribute('data-row-key')) {
            trElement[i].style.background = 'white'
            if (trElement[i].getAttribute('data-row-key') === key) {
              trElement[i].style.background = color
            }
          }
        }
      }
    }
  }

  const [selectedListRows, setSelectedListRow] = useState<any[]>([])

  useEffect(() => {
    expandedRowKeys.length > 0 && activeRow(expandedRowKeys[0].toString())
  }, [expandedRowKeys])

  useEffect(() => {
    onChangeSelect && onChangeSelect(selectedListRows)
  }, [selectedListRows])

  useEffect(() => {
    defaultSelection && setSelectedListRow(defaultSelection)
  }, [])

  return (
    <div ref={tableRef}>
      {Children.map(children, (child: any) => {
        const props: any = {
          expandable: {
            ...child.props.expandable,
            expandRowByClick: true,
            onExpand: (expanded: boolean, record: any) => {
              expanded ? setExpandedRowKeys([record.key]) : setExpandedRowKeys([])
            },
            expandedRowKeys: expandedRowKeys
          },
          bordered: bordered ? bordered : true,
          scroll: { ...child.props.scroll, x: 700, scrollToFirstRowOnChange: true },
          pagination: {
            ...child.props.pagination,
            showSizeChanger: false,
            pageSize: child.props.pagination?.pageSize ? child.props.pagination.pageSize : Config._limit
          },
          destroyOnClose: true
        }
        if (isRowSelection) {
          props.rowSelection = {
            ...child.props.rowSelection,
            checkStrictly: true,
            selectedRowKeys: selectedListRows.map((value) => value.key),
            onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
              if (selected) {
                setSelectedListRow([...selectedListRows, record])
              } else {
                setSelectedListRow(
                  selectedListRows.filter((value) => {
                    return value.key !== record.key
                  })
                )
              }
            },
            onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
              if (selected) {
                setSelectedListRow(selectedListRows.concat(changeRows))
              } else {
                let splitArr = splitArray(selectedListRows, changeRows, 'key')
                setSelectedListRow(splitArr.newArray)
              }
            }
          }
        }
        return cloneElement(child, props)
      })}
    </div>
  )
}

export default TableHoc
