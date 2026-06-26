import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PracticeQuestion from '@/models/PracticeQuestion';

// Static Fallback Question Bank
const STATIC_QUESTION_BANK = {
  MATHS: [
    { q: 'What is the value of √169?', options: ['11', '12', '13', '14'], ans: 2 },
    { q: 'If x² – 5x + 6 = 0, what are the values of x?', options: ['2 and 3', '1 and 6', '–2 and –3', '3 and 4'], ans: 0 },
    { q: 'The HCF of 36 and 48 is:', options: ['6', '8', '12', '16'], ans: 2 },
    { q: 'A train travels 360 km in 4 hours. What is its speed in m/s?', options: ['20 m/s', '25 m/s', '30 m/s', '35 m/s'], ans: 1 },
    { q: 'What is 15% of 840?', options: ['116', '126', '136', '146'], ans: 1 },
    { q: 'The sum of angles of a triangle is:', options: ['90°', '180°', '270°', '360°'], ans: 1 },
    { q: 'log₁₀(1000) = ?', options: ['2', '3', '4', '10'], ans: 1 },
    { q: 'The area of a circle with radius 7 cm is (π = 22/7):', options: ['144 cm²', '154 cm²', '164 cm²', '176 cm²'], ans: 1 },
    { q: 'What is the value of sin 90°?', options: ['0', '0.5', '1', '√2'], ans: 2 },
    { q: 'A number when divided by 56 gives remainder 29. What will be the remainder when divided by 8?', options: ['3', '5', '6', '7'], ans: 1 },
  ],
  SCIENCE: [
    { q: 'What is the chemical formula of water?', options: ['H₂O₂', 'HO₂', 'H₂O', 'H₃O'], ans: 2 },
    { q: 'Which gas is used in photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2 },
    { q: 'The SI unit of force is:', options: ['Joule', 'Watt', 'Newton', 'Pascal'], ans: 2 },
    { q: 'Who proposed the theory of evolution?', options: ['Newton', 'Einstein', 'Darwin', 'Faraday'], ans: 2 },
    { q: 'The atomic number of Carbon is:', options: ['4', '6', '8', '12'], ans: 1 },
    { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], ans: 1 },
    { q: 'Which acid is present in vinegar?', options: ['Lactic acid', 'Acetic acid', 'Citric acid', 'Tartaric acid'], ans: 1 },
    { q: 'The speed of light is approximately:', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], ans: 1 },
    { q: 'DNA stands for:', options: ['Deoxyribose Nucleic Acid', 'Di-nitrogen Acid', 'Double Nitro Acid', 'Deoxy Nitro Acid'], ans: 0 },
    { q: 'Which is the largest organ of the human body?', options: ['Heart', 'Liver', 'Skin', 'Brain'], ans: 2 },
  ],
  COMMERCE: [
    { q: 'GST stands for:', options: ['General Sales Tax', 'Goods and Services Tax', 'Government Service Tax', 'Gross Sales Tax'], ans: 1 },
    { q: 'Which financial statement shows profitability?', options: ['Balance Sheet', 'Cash Flow Statement', 'Profit & Loss Account', 'Trial Balance'], ans: 2 },
    { q: 'SEBI regulates:', options: ['Banking sector', 'Insurance sector', 'Capital market', 'Mutual funds only'], ans: 2 },
    { q: 'Double entry bookkeeping means:', options: ['Two entries for every transaction', 'Debit and Credit for each transaction', 'Two books are maintained', 'Two accountants verify'], ans: 1 },
    { q: 'What is the full form of GDP?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Gross Debt Product'], ans: 0 },
    { q: 'Which tax is levied on personal income?', options: ['Excise Duty', 'Income Tax', 'Customs Duty', 'Sales Tax'], ans: 1 },
    { q: 'Current ratio measures:', options: ['Profitability', 'Liquidity', 'Solvency', 'Efficiency'], ans: 1 },
    { q: 'Depreciation is charged on:', options: ['Current Assets', 'Fixed Assets', 'Intangible Assets', 'Both B and C'], ans: 3 },
    { q: 'RBI was established in:', options: ['1930', '1935', '1947', '1950'], ans: 1 },
    { q: 'Which account always has a credit balance?', options: ['Debtors account', 'Expense account', 'Capital account', 'Purchases account'], ans: 2 },
  ],
  ARTS: [
    { q: 'Who wrote "Wings of Fire"?', options: ['Jawaharlal Nehru', 'A.P.J. Abdul Kalam', 'Mahatma Gandhi', 'Subhash Chandra Bose'], ans: 1 },
    { q: 'The Harappan Civilization belongs to which age?', options: ['Iron Age', 'Stone Age', 'Bronze Age', 'Copper Age'], ans: 2 },
    { q: 'Which is the national language of India?', options: ['English', 'Hindi', 'Sanskrit', 'No official national language'], ans: 3 },
    { q: 'Who is the author of "Arthashastra"?', options: ['Chanakya', 'Ashoka', 'Chandra Gupta', 'Akbar'], ans: 0 },
    { q: 'The Mughal Empire was founded by:', options: ['Akbar', 'Humayun', 'Babur', 'Aurangzeb'], ans: 2 },
    { q: 'Which fundamental right guarantees freedom of speech?', options: ['Article 14', 'Article 19', 'Article 21', 'Article 25'], ans: 1 },
    { q: 'The 73rd Constitutional Amendment is related to:', options: ['Panchayati Raj', 'Urban local bodies', 'Fundamental Rights', 'DPSP'], ans: 0 },
    { q: 'Which river is known as the "Sorrow of Bihar"?', options: ['Ganga', 'Son', 'Gandak', 'Kosi'], ans: 3 },
    { q: 'Who is the "Father of Indian Constitution"?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Rajendra Prasad'], ans: 2 },
    { q: 'Sitar is which type of instrument?', options: ['Percussion', 'String', 'Wind', 'Brass'], ans: 1 },
  ],
  GENERAL: [
    { q: 'Who is the current Chief Justice of India (2025)?', options: ['D.Y. Chandrachud', 'Sanjiv Khanna', 'N.V. Ramana', 'S.A. Bobde'], ans: 1 },
    { q: 'Which country won the FIFA World Cup 2022?', options: ['France', 'Brazil', 'Germany', 'Argentina'], ans: 3 },
    { q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], ans: 2 },
    { q: 'Which is the smallest planet in our Solar System?', options: ['Mercury', 'Mars', 'Venus', 'Pluto'], ans: 0 },
    { q: 'When is "World Environment Day" observed?', options: ['April 22', 'June 5', 'March 22', 'September 16'], ans: 1 },
    { q: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], ans: 1 },
    { q: '"Operation Sindoor" was carried out by India in:', options: ['2023', '2024', '2025', '2026'], ans: 2 },
    { q: 'Which organisation publishes Human Development Index?', options: ['World Bank', 'IMF', 'UNDP', 'WHO'], ans: 2 },
    { q: 'Who invented the World Wide Web?', options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'], ans: 2 },
    { q: 'Which is the national flower of India?', options: ['Rose', 'Jasmine', 'Sunflower', 'Lotus'], ans: 3 },
  ],
  COMPUTER_SCIENCE: [
    { q: 'Which of the following is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], ans: 1 },
    { q: 'What does CPU stand for?', options: ['Central Process Unit', 'Computer Processing Unit', 'Central Processing Unit', 'Control Processing Unit'], ans: 2 },
    { q: 'Which data structure follows the Last In First Out (LIFO) principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'], ans: 1 },
    { q: 'What is the binary representation of decimal number 10?', options: ['1001', '1010', '1100', '1111'], ans: 1 },
    { q: 'Which of the following is an example of non-volatile memory?', options: ['RAM', 'SRAM', 'DRAM', 'ROM'], ans: 3 },
    { q: 'Who is known as the father of modern computers?', options: ['Alan Turing', 'Charles Babbage', 'Bill Gates', 'Steve Jobs'], ans: 0 },
    { q: 'What does HTTP stand for?', options: ['Hypertext Transfer Protocol', 'Hypertext Transmission Protocol', 'High Transfer Text Protocol', 'Hyper Transfer Text Protocol'], ans: 0 },
    { q: 'Which SQL statement is used to extract data from a database?', options: ['GET', 'OPEN', 'SELECT', 'EXTRACT'], ans: 2 },
    { q: 'In computer networks, what does DNS stand for?', options: ['Domain Name System', 'Digital Network Service', 'Data Network System', 'Domain Network Server'], ans: 0 },
    { q: 'What is the time complexity of binary search on a sorted array of size n?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1 },
  ],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'GENERAL';
    const classFilter = searchParams.get('class') || 'All';
    const difficulty = searchParams.get('difficulty') || 'Medium';

    await connectDB();

    // Query DB for questions matching subject, difficulty, and class (either specific class or "All")
    const dbQuery = {
      subject,
      difficulty,
      class: { $in: [classFilter, 'All'] },
      isActive: true,
    };

    const dbQuestions = await PracticeQuestion.find(dbQuery).limit(30).lean();

    let questions = dbQuestions.map(q => ({
      id: q._id.toString(),
      q: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      ans: q.correctOptionIndex,
    }));

    // Fallback to static questions if database query returned no results
    if (questions.length === 0) {
      const staticList = STATIC_QUESTION_BANK[subject] || STATIC_QUESTION_BANK.GENERAL;
      questions = staticList.map((q, idx) => ({
        id: `static-${subject}-${idx}`,
        q: q.q,
        options: q.options,
        ans: q.ans,
      }));
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('[GET /api/lms/practice/questions]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
