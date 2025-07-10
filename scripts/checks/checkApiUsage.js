const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_KEY = process.env.ODDS_API_KEY;

if (!API_KEY) {
  console.error('❌ ODDS_API_KEY not found in environment variables');
  console.log('Please make sure you have ODDS_API_KEY in your .env file');
  process.exit(1);
}

async function checkApiUsage() {
  try {
    console.log('🔍 Checking API usage...\n');
    
    // Make a simple request to get sports list (this is a lightweight endpoint)
    const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
      params: {
        apiKey: API_KEY
      }
    });

    const remaining = response.headers['x-requests-remaining'];
    const used = response.headers['x-requests-used'];
    const total = 500; // Free plan limit
    const percentage = ((used / total) * 100).toFixed(1);

    console.log('📊 API Usage Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Requests Used: ${used}`);
    console.log(`🔄 Requests Remaining: ${remaining}`);
    console.log(`📈 Usage Percentage: ${percentage}%`);
    console.log(`🎯 Monthly Limit: ${total}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Add some visual indicators
    if (parseInt(remaining) < 50) {
      console.log('⚠️  WARNING: You have less than 50 requests remaining!');
    } else if (parseInt(remaining) < 100) {
      console.log('💡 TIP: You have less than 100 requests remaining. Consider monitoring usage more closely.');
    } else {
      console.log('✅ You have plenty of requests remaining.');
    }

    // Show how many days left in the month (approximate)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = daysInMonth - dayOfMonth;
    
    console.log(`\n📅 Days left in current month: ${daysLeft}`);
    
    if (daysLeft > 0) {
      const avgRemainingPerDay = Math.floor(parseInt(remaining) / daysLeft);
      console.log(`📊 Average requests per day remaining: ${avgRemainingPerDay}`);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the check
checkApiUsage(); 