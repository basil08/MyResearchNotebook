module.exports = ({ config }) => {
    const expoConfig = config.expo || {};
    const extraConfig = expoConfig.extra || {};
  
    return {
      ...config,
      expo: {
        ...expoConfig,
        name: "Research Notebook",
        slug: "MyResearchNotebook",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myresearchnotebook",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
          supportsTablet: true,
          bundleIdentifier: "com.basil.myresearchnotebook",
        },
        android: {
          package: "com.basil.myresearchnotebook",
          versionCode: 1,
          adaptiveIcon: {
            backgroundColor: "#E6F4FE",
            foregroundImage: "./assets/images/android-icon-foreground.png",
            backgroundImage: "./assets/images/android-icon-background.png",
            monochromeImage: "./assets/images/android-icon-monochrome.png",
          },
          edgeToEdgeEnabled: true,
          predictiveBackGestureEnabled: false,
          permissions: ["INTERNET"],
        },
        web: {
          output: "static",
          favicon: "./assets/images/favicon.png",
          bundler: "metro",
        },
        plugins: [
          "expo-router",
          [
            "expo-splash-screen",
            {
              image: "./assets/images/splash-icon.png",
              imageWidth: 200,
              resizeMode: "contain",
              backgroundColor: "#ffffff",
              dark: {
                backgroundColor: "#000000",
              },
            },
          ],
        ],
        experiments: {
          typedRoutes: true,
          reactCompiler: true,
        },
        extra: {
          GOOGLE_SHEET_DB_URL: process.env.GOOGLE_SHEET_DB_URL,
          ...extraConfig,
          eas: {
            ...(extraConfig.eas || {}),
            projectId: "4f86ff1e-8914-4a97-8d41-1cd737f8a3a3",
          },
        },
      },
    };
  };
  