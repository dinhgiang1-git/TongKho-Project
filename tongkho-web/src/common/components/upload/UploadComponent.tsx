/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Flex, message, Upload } from 'antd'
import type { GetProp, UploadProps } from 'antd'
import { openNotification } from 'common/utils'
import { AxiosClient } from 'apis/axiosClient'
import styled from 'styled-components'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const UploadStyles = styled(Upload)<{ width: string; height: string }>`
  & .ant-upload-select {
    width: ${(props) => props.width} !important;
    height: ${(props) => props.height} !important;
    over-flow: hidden;
  }
`

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('File ảnh phải có định dạng JPEG, PNG, JPG!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}

interface IUpload {
  onSuccessUpload?: (value: any) => void
  initialImage?: string
  width?: string
  height?: string
}

const UploadSingleFile = ({ onSuccessUpload, initialImage, width = '200px', height = '150px' }: IUpload) => {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>()
  const [progress, setProgress] = React.useState(0)

  const handleOnChange: UploadProps['onChange'] = ({ file }: any) => {
    if (file?.type === 'image/png' || file?.type === 'image/jpeg' || file?.type === 'image/jpg') {
      if (file?.size > 2 * 1024 * 1024) {
        file.status = 'error'

        return openNotification('warning', 'Cảnh báo', 'Vui lòng tải ảnh có dung lượng ảnh nhỏ hơn 2 MB')
      }
    }

    // file type video
    if (file?.type === 'video/mp4') {
      if (file?.size > 100 * 1024 * 1024) {
        file.status = 'error'
        return openNotification('warning', 'Cảnh báo', 'Vui lòng tải video có dung lượng nhỏ hơn 100 MB')
      }
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onProgress } = options
    setLoading(!loading)
    const fmData = new FormData()
    const config = {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (event: any) => {
        const percent = Math.floor((event.loaded / event.total) * 100)
        setProgress(percent)
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000)
        }
        onProgress({ percent: (event.loaded / event.total) * 100 })
      }
    }
    fmData.append('image', file)
    try {
      const res: any = await AxiosClient.post(`uploads/image`, fmData, config)
      setImageUrl(res?.data?.absoluteUrl)
      onSuccessUpload(res?.data?.absoluteUrl)
      setLoading(!loading)
    } catch (error) {
      console.log('🚀 ~ handleUpload ~ error:', error)
    }
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type='button'>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  )

  return (
    <Flex gap='middle' wrap>
      <UploadStyles
        name='avatar'
        listType='picture-card'
        className='avatar-uploader'
        showUploadList={false}
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        onChange={handleOnChange}
        width={width}
        height={height}
      >
        {imageUrl ? (
          <img src={imageUrl} alt='avatar' style={{ width: '100%' }} />
        ) : initialImage ? (
          <img src={initialImage} alt='avatar' style={{ width: '100%' }} />
        ) : (
          uploadButton
        )}
      </UploadStyles>
    </Flex>
  )
}

export default UploadSingleFile
