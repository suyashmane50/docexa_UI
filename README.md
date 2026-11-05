# Welcome to your Expo app 👋

# require development kit

- node 18

# deploy on server

```
npx expo export --platform web
```

# App Build Process:

1. npx expo prebuild --clean
2. npx expo login
3. eas whoami
4. eas build --platform android --profile preview # For Test
5. eas build --platform android --profile production # For Production

<!-- updated Api's -->

# Patient uploaded reports: https://api-staging.docexa.com/api/v4/patient/get_reports?patient_id=2648

<!-- updated Api's -->
