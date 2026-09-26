import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const isView = searchParams.get('view') === 'true';

    // Allowed filenames to prevent directory traversal
    const allowedFiles: Record<string, { mime: string; name: string }> = {
      'HireSense_Complete_Source_Code.html': {
        mime: 'text/html; charset=utf-8',
        name: 'HireSense_Complete_Source_Code.html',
      },
      'HireSense_Complete_Source_Code.md': {
        mime: 'text/markdown; charset=utf-8',
        name: 'HireSense_Complete_Source_Code.md',
      },
      'hiresense_source_code.zip': {
        mime: 'application/zip',
        name: 'hiresense_source_code.zip',
      },
    };

    const fileMeta = allowedFiles[filename];
    if (!fileMeta) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    const headers = new Headers();
    headers.set('Content-Type', fileMeta.mime);
    if (!isView) {
      headers.set('Content-Disposition', `attachment; filename="${fileMeta.name}"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${fileMeta.name}"`);
    }
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
