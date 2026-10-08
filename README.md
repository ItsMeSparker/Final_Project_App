# Expo Router Example

Use [`expo-router`](https://docs.expo.dev/router/introduction/) to build native navigation using files in the `app/` directory.

## 🚀 How to use

```sh
npx create-expo-app -e with-router
```

## 📝 Notes

- [Expo Router: Docs](https://docs.expo.dev/router/introduction/)

# Final Project App - Frontend

A React Native frontend built with Expo, featuring camera capabilities, image uploading, secure storage, and routing. 

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Docker & Docker Compose](https://www.docker.com/) (optional, for containerized development)
- [Expo Go](https://expo.dev/client) app installed on your iOS/Android device for testing

## ⚙️ Environment Setup

1. Create a `.env` file in the root directory.
2. **Backend Connection:** You need to expose your backend (which runs on port 8000) so this frontend app can access it. Run an ngrok tunnel (or your preferred tunnel tool) on port 8000 or any port of your backend:
   ```bash
   ngrok http 8000
### **🔗 Related Repositories / PRs**
- **Backend Repository:** https://github.com/supakornpao/Rabbit_backend.git