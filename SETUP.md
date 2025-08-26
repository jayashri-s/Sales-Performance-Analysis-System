# Sales Performance Analysis System - Setup Guide

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000` or the port shown in the terminal.

## ✨ Features Available

### ✅ Working Now (No API Key Required)
- **Dashboard Overview** - View sales metrics and KPIs
- **Data Upload** - Upload your own JSON files
- **Sample Data** - Load pre-configured sample data
- **Filtering & Search** - Filter by agent, region, outcome
- **Visualizations** - Charts and graphs for data insights
- **Local Analysis** - Basic transcript analysis without AI

### 🔧 Enhanced Features (Requires API Key)
- **AI-Powered Analysis** - Advanced transcript analysis with Gemini AI
- **Detailed Recommendations** - AI-generated improvement suggestions
- **Advanced Insights** - Deeper conversation analysis

## 🔑 Enable AI Analysis (Optional)

To enable AI-powered analysis using Gemini:

1. **Get a Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free API key

2. **Create a .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API key to .env:**
   ```env
   NUXT_GEMINI_API_KEY=your_api_key_here
   ```

4. **Restart the development server:**
   ```bash
   npm run dev
   ```

## 📁 Data Format

Your JSON files should follow this structure:
```json
[
  {
    "id": 1,
    "salesAgentName": "John Doe",
    "customerName": "Customer Name",
    "callTimestamp": "2025-07-12T11:29:00",
    "callDurationSec": 514,
    "region": "State/Region",
    "language": "English",
    "product": "Product Name",
    "leadSource": "Email Campaign",
    "amountQuoted": 14990,
    "callOutcome": "Interested",
    "sentiment": "positive",
    "tags": ["demo-booked", "hot-lead"],
    "voiceNoteTranscript": "Full transcript text..."
  }
]
```

## 🎯 How to Use

1. **Load Data:** Click "Load Sample Data" or upload your JSON file
2. **Explore Dashboard:** View KPIs, agent performance, and trends
3. **Filter Results:** Use search and filters to find specific records
4. **View Details:** Click "View" on any record to see full transcript
5. **Analyze:** Click "Analyze with AI" for detailed insights

## 📊 Analysis Features

- **Agent Performance Rankings**
- **Revenue by Region Charts**
- **Call Outcome Distribution**
- **Sales Trends Over Time**
- **Keyword Frequency Analysis**
- **Lead Source Effectiveness**
- **Sentiment Analysis**

## 🔧 Troubleshooting

### API Errors
- If you see "404 Page not found: /api/analyze-transcript", restart the dev server
- The system will use local analysis if AI analysis fails

### Data Issues
- Ensure your JSON file follows the correct format
- Check that required fields (salesAgentName, customerName, etc.) are present

### Performance
- Large datasets (>1000 records) may load slowly
- Consider filtering data for better performance

## 📝 Your Existing Files Integration

The system automatically integrates with:
- `lms_sales_calls_with_long_transcripts.json` - Your dataset
- `salesAnalysisSystem.js` - Your existing analysis logic (now integrated in the API)

## 🎉 You're All Set!

The system is ready to use with your existing data. Start by loading sample data or uploading your JSON file to see the full dashboard in action!