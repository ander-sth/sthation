import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

// Tipos de arquivos permitidos
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['application/pdf', 'image/jpeg', 'image/png'],
  evidence: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'],
}

// Tamanho máximo por tipo (em bytes)
const MAX_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  certificate: 10 * 1024 * 1024, // 10MB
  evidence: 50 * 1024 * 1024, // 50MB
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'image'
    const folder = formData.get('folder') as string || 'uploads'
    const entityId = formData.get('entityId') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ALLOWED_TYPES[type] || ALLOWED_TYPES.image
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validar tamanho
    const maxSize = MAX_SIZES[type] || MAX_SIZES.image
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const pathname = entityId 
      ? `${folder}/${entityId}/${timestamp}-${safeName}`
      : `${folder}/${timestamp}-${safeName}`

    // Upload para Vercel Blob (usando store privado)
    const blob = await put(pathname, file, {
      access: 'public', // Usando public para facilitar acesso a imagens
      contentType: file.type,
    })

    return NextResponse.json({ 
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    })
  } catch (error) {
    console.error('[UPLOAD] Erro:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}
