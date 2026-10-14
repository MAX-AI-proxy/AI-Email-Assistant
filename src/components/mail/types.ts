export type EmailMessage = {
  uid: number
  subject: string
  senderName: string
  senderAddress: string
  date: string | null
  unread: boolean
}

export type MailResponse = {
  ok: boolean
  account?: string
  totalMessages?: number
  messages?: EmailMessage[]
  error?: string
}

export type Recipient = {
  name: string
  address: string
}

export type Attachment = {
  id: number
  filename: string
  contentType: string
  size: number
}

export type DetailedMessage = {
  uid: number
  subject: string
  senderName: string
  senderAddress: string
  recipients: Recipient[]
  date: string | null
  unread: boolean
  text: string
  attachments: Attachment[]
}

export type MessageResponse = {
  ok: boolean
  message?: DetailedMessage
  error?: string
}

export type AccountData = {
  messages: EmailMessage[]
  totalMessages: number
  loading: boolean
  error: string | null
}


export type MailAccount = { id: string; name: string; description: string }
