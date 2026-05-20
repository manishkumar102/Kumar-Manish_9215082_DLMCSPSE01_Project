import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'Phase1_Composite.docx');
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Phase1_Composite.docx"',
      },
    });
  } catch (error) {
    console.error('[DOWNLOAD_GET]', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
