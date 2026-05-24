/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { AxiosClient } from 'apis/axiosClient'
import { openNotificationError } from 'common/utils'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

interface UploadMultipartProps {
  defaultFileList?: {
    uid: string
    name: string
    url: string
  }[]
  onFileListChange?: (newFileList: UploadFile[]) => void // Callback để truyền fileList mới
}

const UploadMultipart: React.FC<UploadMultipartProps> = ({ defaultFileList = [], onFileListChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [progress, setProgress] = React.useState(0)
  const [fileList, setFileList] = useState<any>([])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  useEffect(() => {
    setFileList(defaultFileList)
  }, [defaultFileList])

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
    if (onFileListChange) {
      onFileListChange(newFileList)
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onProgress, onSuccess, onError } = options
    const fmData = new FormData()
    const config = {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (event: any) => {
        const percent = Math.floor((event.loaded / event.total) * 100)
        setProgress(percent)
        onProgress({ percent })
      }
    }
    fmData.append('image', file)
    try {
      const res: any = await AxiosClient.post(`uploads/image`, fmData, config)
      onSuccess({ url: res?.data?.absoluteUrl })
    } catch (error) {
      openNotificationError(error)
      onError(error)
    }
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type='button'>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  )
  return (
    <>
      <Upload
        customRequest={handleUpload}
        listType='picture-card'
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {fileList.length >= 5 ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage('')
          }}
          src={previewImage}
        />
      )}
    </>
  )
}

export default UploadMultipart
