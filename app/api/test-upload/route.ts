// app/api/test-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    return NextResponse.json({
      message: 'Form data received',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json(
      { message: 'Error in test upload', error: String(error) },
      { status: 500 }
    );
  }

  const testUpload = async () => {
  if (!file) {
    toast({
      title: "No File Selected",
      description: "Please select a file first",
      variant: "destructive",
    });
    return;
  }
  
  setLoading(true);
  
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/test-upload", {
      method: "POST",
      body: formData,
    });
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Test upload non-JSON response:", text);
      throw new Error("Server returned an invalid response format");
    }
    
    const data = await response.json();
    console.log("Test upload response:", data);
    
    toast({
      title: "Test Upload Successful",
      description: `Received ${data.fileName} (${data.fileSize} bytes)`,
    });
  } catch (error) {
    console.error("Test upload error:", error);
    toast({
      title: "Test Upload Failed",
      description: String(error),
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

// Add this button somewhere in your UI
<Button onClick={testUpload} variant="outline" className="mt-4">
  Test Upload Only
</Button>
}
