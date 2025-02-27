# Multi-Modal Chain-of-Thought Chat Application

This is a Next.js application that implements a chat interface with OpenAI's GPT-4o model, featuring:

1. Basic LLM chat functionality
2. Multi-modal support for image uploads
3. Chain-of-thought reasoning with visible thinking steps
4. Responsive UI for the chain-of-thought reasoning

## Features

### Basic Chat
- Text-based conversation with OpenAI's GPT-4o model
- Clean, responsive UI
- Real-time message display

### Multi-Modal Support
- Upload and send images along with text
- Image preview before sending
- Support for multiple image uploads

### Chain-of-Thought Reasoning
- Visibility into the AI's thinking process
- Toggle to show/hide thinking steps
- Structured responses with reasoning and answers

### Responsive UI
- Mobile-friendly design
- Smooth animations and transitions
- Clear visual distinction between user and AI messages

## Technical Implementation

### Frontend
- Built with Next.js and React
- Styled with Tailwind CSS
- Custom FilePicker component for image uploads

### Backend
- API routes for chat and file uploads
- Integration with OpenAI's API
- Chain-of-thought prompting technique

### Libraries and Tools
- TypeScript for type safety
- Next.js for server-side rendering and API routes
- Tailwind CSS for styling

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd web
   npm install
   ```

### Running the Application
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Deployment Considerations for On-Premise Servers

For deploying this application on customer servers:

1. **Environment Setup**:
   - Ensure Node.js 18+ is installed on the server
   - Set up proper environment variables for API keys

2. **Network Configuration**:
   - Configure firewall rules to allow outbound connections to OpenAI's API
   - Set up proper DNS resolution

3. **Security Considerations**:
   - Store API keys securely using environment variables or a secrets manager
   - Implement proper authentication for the application
   - Consider rate limiting to prevent abuse

4. **Scaling**:
   - For high-traffic deployments, consider containerization with Docker
   - Implement a load balancer for multiple instances

5. **Monitoring and Logging**:
   - Set up application monitoring
   - Implement proper error logging
   - Monitor API usage to prevent unexpected costs

6. **Data Privacy**:
   - Ensure compliance with data privacy regulations
   - Consider implementing data retention policies
   - Add proper disclaimers about data usage

## License
This project is licensed under the MIT License.
