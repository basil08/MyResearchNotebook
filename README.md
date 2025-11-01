# My Research Notebook 📚

A beautiful, intuitive mobile application for tracking your daily research, learning, and personal development. Built with React Native and Expo, this app helps you maintain a structured log of your intellectual journey.

# TODO for version 2

1. Markdown preview is broken in Research Log card
2. Remove unnecessary emojis from UI
3. "What do I plan to do?" is missing
4. Make research card appear as full screens when clicked on
5. Ensure lazy loading is working

## Features ✨

### Core Functionality
- **Daily Research Logs**: Document your daily activities with 8 comprehensive fields
- **CRUD Operations**: Create, Read, Update, and Delete research logs
- **Google Sheets Integration**: Your data is stored in Google Sheets for easy access and export

### User Experience (NEW!)
- **🎯 Multi-Step Full-Screen Form**: Beautiful step-by-step form with progress indicator, full-screen text fields, and loading states
- **🔗 Smart URL Handling**: Automatically detects and condenses URLs to `[1]`, `[2]` format - clickable and clean
- **♾️ Lazy Loading**: Infinite scroll that loads 10 items at a time for optimal performance
- **🎨 Smart Filtering**: Quick filters (Last 7 Days, This Month, Last Month) + custom date ranges
- **🌙 Dark Mode**: Automatically adapts to your device's theme
- **🔄 Pull to Refresh**: Easily sync your data from Google Sheets
- **📱 Responsive UI**: Beautiful, modern interface optimized for mobile

## Research Log Fields 📝

Each log entry can contain:

1. **What I plan to read today?** - Set your reading intentions
2. **What did I read today?** - Track your reading progress
3. **What did I learn today?** - Capture key learnings
4. **What new things did I think of today?** - Record new ideas and insights
5. **What did I code/implement today?** - Document your development work
6. **What did I write today? Or, what did I teach others?** - Track your knowledge sharing
7. **What are some things I should try tomorrow?** - Plan your next steps

## Platform Support 📱💻

This app works on:
- **iOS** - Native mobile app
- **Android** - Native mobile app  
- **Web** - Progressive Web App (PWA)

### Web Deployment 🌐
Your Research Notebook can be deployed as a static website! 

**Quick Start:**
```bash
npm run web           # Development
npm run build:web     # Build for production
npm run serve:web     # Test production build
```

**Deploy to popular platforms:**
- 🔷 **Vercel** (recommended) - [Quick Start Guide](./WEB_QUICKSTART.md)
- 🔶 **Netlify** - [Quick Start Guide](./WEB_QUICKSTART.md)
- 🔸 **GitHub Pages** - [Full Guide](./WEB_DEPLOYMENT.md)
- 🔹 **AWS S3 + CloudFront** - [Full Guide](./WEB_DEPLOYMENT.md)

See [WEB_QUICKSTART.md](./WEB_QUICKSTART.md) for 5-minute deployment or [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md) for comprehensive instructions.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- A Google Sheet setup with proper API access

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd MyResearchNotebook
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
GOOGLE_SHEET_DB_URL=your_google_sheet_api_url_here
```

4. Start the development server:
```bash
npm start
```

5. Run on your device:
   - **iOS:** `npm run ios`
   - **Android:** `npm run android`
   - **Web:** `npm run web`
   - **Mobile (Expo Go):** Scan the QR code with Expo Go app

## Google Sheets Setup 📊

Your Google Sheet should have the following columns (headers in the first row):

- `id` - Unique identifier (UUID)
- `created_by` - Author name (hardcoded to "basil")
- `date` - Date of the log (YYYY-MM-DD format)
- `plan_to_read` - Reading plans
- `did_read` - What was read
- `learned_today` - Learning notes
- `new_thoughts` - New ideas
- `coded_today` - Coding/implementation notes
- `wrote_or_taught` - Writing or teaching notes
- `try_tomorrow` - Tomorrow's plans
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

### Setting Up Google Sheets API

You'll need to create a Google Apps Script or use Google Sheets API to handle CRUD operations. The expected endpoints are:

- **GET** `GOOGLE_SHEET_DB_URL` - Fetch all logs
- **POST** `GOOGLE_SHEET_DB_URL` - Create a new log
- **PUT** `GOOGLE_SHEET_DB_URL?id={id}` - Update a log
- **DELETE** `GOOGLE_SHEET_DB_URL?id={id}` - Delete a log

Example Google Apps Script can be deployed as a web app to provide these endpoints.

## Project Structure 📁

```
MyResearchNotebook/
├── app/                      # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx        # Main screen with log list
│   │   └── explore.tsx      # About/Help screen
│   └── _layout.tsx
├── components/              # React components
│   ├── research-log-form.tsx      # Form for creating/editing logs
│   ├── research-log-list.tsx      # List view with scroll and delete
│   └── research-log-filter.tsx    # Filter modal
├── services/               # API services
│   └── research-log-service.ts    # Google Sheets integration
├── types/                  # TypeScript type definitions
│   └── research-log.ts
├── assets/                 # Images and static files
└── constants/              # App constants and themes
```

## Technologies Used 🛠️

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **uuid** - Unique ID generation
- **expo-constants** - Environment variables

## Usage Guide 📱

### Creating a Log

1. Tap the **"+ New Log"** button on the home screen
2. Fill in any fields you want (all fields are optional)
3. Tap **"Create"** to save your log

### Editing a Log

1. Find the log you want to edit in the list
2. Tap the **"Edit"** button on the log card
3. Make your changes
4. Tap **"Update"** to save

### Deleting a Log

1. Find the log you want to delete
2. Tap the **"Delete"** button
3. Confirm the deletion in the popup

### Filtering Logs

1. Tap the **🔍** filter icon in the header
2. Choose a quick filter or enter custom dates
3. Tap **"Apply"** to filter the list
4. Tap **"Clear"** to remove filters

### Refreshing Data

Pull down on the log list to refresh and sync with your Google Sheet database.

## Development 💻

### Running in Development Mode

```bash
npm start
```

### Building for Production

```bash
# For Android
eas build --platform android --profile production

# For iOS
eas build --platform ios --profile production

# For Web
npm run build:web
```

See [BUILD_GUIDE.md](./BUILD_GUIDE.md) for mobile builds and [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md) for web deployment.

### Linting

```bash
npm run lint
```

## Environment Variables 🔐

Create a `.env` file in the root directory:

```
GOOGLE_SHEET_DB_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is open source and available under the MIT License.

## Support 💬

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Acknowledgments 🙏

- Built with [Expo](https://expo.dev/)
- Icons from [SF Symbols](https://developer.apple.com/sf-symbols/)
- Inspired by the need for better research tracking and personal development tools

---

Made with ❤️ for researchers, learners, and knowledge enthusiasts.
