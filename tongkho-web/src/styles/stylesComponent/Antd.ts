/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table } from 'antd'
import styledComponents from 'styled-components'

export const TableStyle = styledComponents(Table)`
.ant-table-thead > tr > th{
}

.ant-table-row .ant-table-cell {
  padding-top: 8px;
  padding-bottom: 8px;
}




.ant-table-thead > tr > th {
  padding:10px 10px;
}
   .ant-pagination-item{
    border-radius: 4px !important;
    min-width: 29px !important;
    height: 29px !important;
}


.ant-pagination-prev .ant-pagination-item-link , .ant-pagination-next .ant-pagination-item-link {
  border: 1px solid white !important;
  background-color: white !important;
  width: 29px !important;
  height: 28px !important;
  border-radius: 4px !important;
  padding: 0;
}

  .ant-table-row {
    background: ${(props: any) => {
      return ''
    }};
  }
},
`

// export const RcImage = styledComponents(Image)`
// &&.ant-image  {
//   margin: 100px !important;
// }
// `

// export const RowStyle = styledComponents(Row)`
// .ant-input-search
//   > .ant-input-group
//   > .ant-input-group-addon:last-child
//   .ant-input-search-button:not(.ant-btn-primary) {
//   border-top-right-radius: 5px;
//   border-bottom-right-radius: 5px;
//   height: 35px;
// }
// `

// export const ButtonStyle = styledComponents(Button)`
// &.ant-btn {
//   background-color:${(props) => (props.color ? props.color : colors.primary)};
// }
// &:hover {
//   background-color: ${colors.primary} !important;
//   border: 1px solid blue !important;
//   outline: 1.5px red !important;
// }
// `

// export const NumberLine = styledComponents.span`
// display: -webkit-box;
// /* max-height: 4.2rem; */
// -webkit-box-orient: vertical;
// overflow: hidden;
// text-overflow: ellipsis;
// white-space: normal;
// line-height: 1.6rem;
// -webkit-line-clamp:1;
