import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Process the files (in a real app, you might store them in a cloud storage)
    const fileDetails = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    }));

    // Return the file details
    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: fileDetails
    });
  } catch (error) {
    console.error('Error in upload API route:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'File upload API is running'
  });
} 