# Weather Forecast App

A cross-platform React Native application built with Expo. It retrieves current conditions and a five-day forecast from OpenWeather, supports metric and imperial units, and changes its background to match the reported weather condition.

## Technology

- React Native and Expo
- TypeScript
- Axios
- OpenWeather current-weather and forecast APIs

## Features

- Search weather by city
- Current temperature, humidity, wind speed, and condition
- Five-day midday forecast
- Metric and imperial unit switching
- Condition-specific background images
- Loading and last-updated states

## Setup

```bash
npm ci
cp .env.example .env
npm start
```

Set `EXPO_PUBLIC_OPENWEATHER_API_KEY` in `.env` before starting the app.

Expo public environment variables are embedded in the client bundle. Restrict the OpenWeather key in the provider account and do not treat it as a server-side secret.

## Security notice

An OpenWeather key was previously committed directly in the source. It must be revoked or rotated. This cleanup removes it from the current branch but does not rewrite Git history.

## Available commands

```bash
npm run android
npm run ios
npm run web
npm run lint
```
