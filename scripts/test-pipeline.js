const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const natural = require('natural');

async function test() {
  console.log('Testing PDF parsing and TF-IDF...');
  const filePath = path.join(__dirname, '..', 'sample_resumes', 'Alex_Tan_Software_Engineer.pdf');
  const buffer = fs.readFileSync(filePath);

  const pdfData = await pdf(buffer);
  console.log('Extracted text preview:', pdfData.text.slice(0, 150));

  const jobDesc = 'Seeking a skilled Software Engineer with 2 or more years of hands-on experience in Python, JavaScript, and RESTful API design. Must have proficiency with SQL databases, Git version control, and Agile development. Experience with AWS or Azure cloud platforms is valued.';

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(jobDesc);
  tfidf.addDocument(pdfData.text);

  let matchCount = 0;
  tfidf.tfidfs('python', (doc, measure) => {
    if (measure > 0) matchCount++;
  });

  console.log('Python matched in documents count:', matchCount);
  console.log('Pipeline test passed successfully!');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
