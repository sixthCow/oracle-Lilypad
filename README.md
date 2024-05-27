# Oracle

Oracle is an innovative tool developed to summarize your Twitter timeline using cutting-edge AI. This project was created for the HackFS hackathon, leveraging the power of Lilypad for AI and RapidAPI for Twitter data.

## Features

- **AI-Powered Summarization**: Get concise summaries of your Twitter timeline.
- **Seamless Integration**: Utilizes Lilypad for AI processing and RapidAPI for Twitter timeline data.
- **User-Friendly Interface**: A React-based frontend for easy interaction.

## Getting Started

To get Oracle running locally, follow the steps below:

### Prerequisites

- Node.js installed on your machine
- NPM (Node Package Manager)
- A Web3 private key for Lilypad
- RapidAPI keys for Twitter and news data

### Installation

#### Backend Server

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Add your `WEB3_PRIVATE_KEY_LILYPAD` to the `.env` file:
   ```env
   WEB3_PRIVATE_KEY_LILYPAD=your_private_key_here
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

#### Client (Frontend)

1. Navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Fill in the `.env` file with your RapidAPI keys:
   ```env
   REACT_APP_X_RAPIDAPI_KEY=your_rapidapi_key_here
   REACT_APP_NEWS_RAPIDAPI_KEY=your_news_api_key_here
   ```

4. Start the client application:
   ```bash
   npm start
   ```

### Usage

Once both the backend server and the client application are running, you can interact with Oracle through the user-friendly web interface. 

## Contributing

We welcome contributions! If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License.

## Acknowledgements

- **Lilypad**: For powering the AI summarization
- **RapidAPI**: For providing access to Twitter timeline data
- **HackFS Hackathon**: For inspiring the creation of this project

---

Dive into your Twitter timeline with Oracle, and experience the power of AI-driven insights!