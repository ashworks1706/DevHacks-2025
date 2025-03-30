# Lux - Your Smart Wardrobe Assistant

## Project Overview

Lux is an intelligent wardrobe assistant designed to revolutionize how you dress for any occasion. Our application:

- Takes photos of your clothing items
- Analyzes occasion requirements
- Checks weather, location, and style trends
- Recommends outfits from your own wardrobe
- Leverages multimodal AI for visual analysis

## Getting Started

### Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- npm or yarn

### Installation

#### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows, use: venv\Scripts\activate
   ```

3. Install required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the environment:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your API keys and configuration settings.

#### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

### Backend

1. From the backend directory with the virtual environment activated:
   ```bash
   python index.py
   ```
   The API server will start on http://localhost:5000 by default.

### Frontend

1. From the frontend directory:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The development server will start on http://localhost:3000 by default.

2. Open your browser and navigate to http://localhost:3000

## Testing

### Backend Tests

Run the test suite with:

```bash
cd backend
python -m pytest
# or for a specific test file
python test_index.py
```

### Frontend Tests

```bash
cd frontend
npm test
# or
yarn test
```

## Project Structure

```
├── backend/
│   ├── __pycache__/
│   ├── venv/
│   ├── .env
│   ├── index.py              # Main backend entry point
│   ├── requirements.txt      # Python dependencies
│   ├── screenshot1.png       # Test images
│   ├── screenshot2.png
│   ├── screenshot3.png
│   ├── test_image.jpeg
│   └── test_index.py         # Test suite
│
├── frontend/
│   ├── .clerk/
│   ├── .next/
│   ├── node_modules/
│   ├── public/
│   │   ├── images/           # Static images
│   │   ├── uploads/          # User uploaded content
│   │   ├── users/            # User profile data
│   │   └── *.svg             # SVG assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── about/
│   │   │   ├── api/
│   │   │   │   ├── upload/
│   │   │   │   └── user-preferences/
│   │   │   ├── features/
│   │   │   └── outfits/
│   │   └── ...
│   ├── README.md
│   └── keyless.json
```

## Features

### Core Capabilities

- **Wardrobe Digitization**: Upload and categorize your clothing items
- **Outfit Recommendation**: Get personalized outfit suggestions based on occasion and weather
- **Style Matching**: Recommendations aligned with current fashion trends from Pinterest
- **Weather Integration**: Outfit suggestions adapt to current and forecasted weather conditions

### Advanced Features

- **Smart Layering System**: Automatically suggests layering options based on temperature fluctuations
- **Color Harmony Analysis**: Ensures outfit components match using color theory algorithms
- **Confidence Boost Metrics**: Rates how well an outfit matches the occasion to build user confidence
- **Wardrobe Gap Analysis**: Identifies missing essential pieces that would increase outfit options

## Demo Workflow

1. Register/Login to your account
2. Upload clothing items through the camera interface
3. Select an occasion and preferences
4. Review and save recommended outfits
5. Explore additional features through the navigation menu

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Python with Flask
- **AI Processing**: Multimodal AI for image recognition
- **Authentication**: Clerk
- **Storage**: Local storage for demo purposes
- **APIs**: Weather, location services, and style trend integrations

## Color Palette

- Primary colors: FFD6FF, E7C6FF, C8B6FF, B8C0FF, BBD0FF
- Secondary colors: FFE5EC, FFC2D1, FFB3C6, FF8FAB, FB6F92

## Team

- Backend Developer 1: Ash
- Backend Developer 2: Darsh
- Frontend Developer: George Badulescu
- Frontend/Presentation Developer: Aryan Patel

## Troubleshooting

### Common Issues

- **Image upload fails**: Ensure you have proper permissions for the uploads directory
- **API connection errors**: Check your .env configuration and API keys
- **Frontend not connecting to backend**: Verify the API URL in your frontend configuration

For additional support, please create an issue in the repository or contact the team.
