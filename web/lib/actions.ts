"use server"

import { queryOpenAI, uploadFilesToChatGPT } from "./chatgpt"

const previous: object[] = []

export async function queryChatGPT(message: string) {
  previous.push({
    role: "user",
    content: message
  })
  const result = await queryOpenAI(previous)
  return result.choices[0]
}

export async function uploadMultimedia(formData: FormData) {
  console.log('[actions] formData:', formData)
  return await uploadFilesToChatGPT(formData).catch((err) => {
    console.log('[actions] error uploading formData:', err)
  })
}