// scripts/test-pdf-extraction.js
// Run this with: node scripts/test-pdf-extraction.js

const { extractTextFromPDF } = require('../app/api/extract/extractUtils');
const path = require('path');

async function testEnhancedExtraction() {
  console.log('🧪 Testing Enhanced PDF Extraction Methods...\n');
  
  // You'll need to put a test PDF file in your project root
  const testPdfPath = path.join(process.cwd(), 'test-lab-report.pdf');
  
  try {
    console.log('📄 Testing file:', testPdfPath);
    
    const startTime = Date.now();
    const extractedText = await extractTextFromPDF(testPdfPath);
    const endTime = Date.now();
    
    console.log('✅ Extraction successful!');
    console.log('⏱️  Time taken:', (endTime - startTime) + 'ms');
    console.log('📏 Text length:', extractedText.length, 'characters');
    console.log('🔤 First 200 characters:');
    console.log(extractedText.substring(0, 200));
    console.log('\n📋 Last 200 characters:');
    console.log(extractedText.substring(extractedText.length - 200));
    
    // Test for common lab terms
    const labTerms = ['hemoglobin', 'glucose', 'creatinine', 'cholesterol', 'test', 'result', 'normal'];
    const foundTerms = labTerms.filter(term => 
      extractedText.toLowerCase().includes(term.toLowerCase())
    );
    
    console.log('\n🔍 Lab-related terms found:', foundTerms);
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testEnhancedExtraction();
