import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      // TXT and other text-based formats
      text = buffer.toString('utf-8');
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}
