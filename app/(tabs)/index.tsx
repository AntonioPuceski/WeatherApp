import axios from 'axios';
import { demoWeather } from '@/utils/demoWeather';
import { temperature, windSpeed } from '@/utils/units';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

const backgrounds: Record<string, any> = {
  Clear: require('../../assets/images/clear.jpg'),
  Clouds: require('../../assets/images/clouds.jpg'),
  Drizzle: require('../../assets/images/drizzle.jpg'),
  Mist: require('../../assets/images/mist.jpg'),
  Rain: require('../../assets/images/rain.jpg'),
  Snow: require('../../assets/images/snow.jpg'),
  Thunderstorm: require('../../assets/images/thunderstorm.jpg'),
};

const defaultBackground = require('../../assets/images/clear.jpg'); // default background image

export default function HomeScreen() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getWeather = async () => {
    if (!city.trim() || loading) return;
    if (!API_KEY && !DEMO_MODE) {
      alert('OpenWeather API configuration is missing.');
      return;
    }
    setLoading(true);
    setWeather(null);
    setForecast([]);
    setSelectedDay(null);
    try {
      // Store API values in metric; convert only for display.
      const weatherResponse = DEMO_MODE ? { data: demoWeather(city).current } : await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
      );

      setWeather(weatherResponse.data);

      // 5-day forecast
      const forecastResponse = DEMO_MODE ? { data: demoWeather(city).forecast } : await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=metric`
      );

      // Process forecastResponse to get one forecast per day (at 12:00:00)
      const dailyForecasts: any[] = [];
      const forecastList = forecastResponse.data.list;

      const dates = new Set<string>();
      for (const item of forecastList) {
        if (item.dt_txt.includes('12:00:00')) {
          if (!dates.has(item.dt_txt.slice(0, 10))) {
            dailyForecasts.push(item);
            dates.add(item.dt_txt.slice(0, 10));
          }
        }
        if (dailyForecasts.length === 5) break;
      }

      setForecast(dailyForecasts);
      setLastUpdated(new Date());
    } catch {
      alert('City not found or error fetching data!');
      setWeather(null);
      setForecast([]);
      setLastUpdated(null);
      setSelectedDay(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  const weatherCondition = weather?.weather?.[0]?.main;
  const backgroundImage =
    weatherCondition && backgrounds[weatherCondition]
      ? backgrounds[weatherCondition]
      : defaultBackground;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[
            styles.overlay,
            { backgroundColor: weather ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)' },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>🌤️ Weather App</Text>
          {DEMO_MODE && <Text style={styles.demo}>DEMO MODE - Fictional weather data</Text>}
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            placeholderTextColor="#666"
            value={city}
            onChangeText={setCity}
          />
          <View style={styles.buttonRow}>
            <Button title="Get Weather" disabled={loading} onPress={getWeather} color="#1E90FF" />
            <TouchableOpacity accessibilityRole="button" onPress={toggleUnit} style={styles.unitButton}>
              <Text style={styles.unitButtonText}>
                Switch to {unit === 'metric' ? '°F' : '°C'}
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 20 }} />
          )}

          {weather && !loading && (
            <>
              <View style={styles.result}>
                <Text style={styles.city}>{weather.name}</Text>
                <Text style={styles.temp}>
                  {temperature(weather.main.temp, unit)}
                  {tempUnit}
                </Text>
                <Text style={styles.condition}>{weather.weather[0].main}</Text>
                <Text style={styles.details}>
                  Feels like: {temperature(weather.main.feels_like, unit)}
                  {tempUnit}
                </Text>
                <Text style={styles.details}>Humidity: {weather.main.humidity}%</Text>
                <Text style={styles.details}>
                  Wind speed: {windSpeed(weather.wind.speed, unit)} {windUnit}
                </Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
                  }}
                  style={{ width: 150, height: 150 }}
                />
                {lastUpdated && (
                  <Text style={styles.updated}>
                    Last updated: {formatDate(lastUpdated)}
                  </Text>
                )}
              </View>

              <Text style={[styles.title, { marginTop: 20 }]}>5-Day Forecast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 10 }}
              >
                {forecast.map((day, index) => (
                  <TouchableOpacity
                    key={index} accessibilityRole="button" accessibilityLabel={`Forecast ${day.dt_txt.slice(0, 10)}`}
                    style={[
                      styles.forecastCard,
                      selectedDay === index && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedDay(index)}
                  >
                    <Text style={styles.forecastDate}>{day.dt_txt.slice(0, 10)}</Text>
                    <Image
                      source={{
                        uri: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
                      }}
                      style={{ width: 50, height: 50 }}
                    />
                    <Text style={styles.forecastTemp}>
                      {temperature(day.main.temp, unit)}
                      {tempUnit}
                    </Text>
                    <Text style={styles.forecastCondition}>{day.weather[0].main}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDay !== null && (
                <View style={styles.forecastDetails}>
                  <Text style={styles.details}>
                    Date: {forecast[selectedDay].dt_txt}
                  </Text>
                  <Text style={styles.details}>
                    Temp: {temperature(forecast[selectedDay].main.temp, unit)}
                    {tempUnit}
                  </Text>
                  <Text style={styles.details}>
                    Feels like: {temperature(forecast[selectedDay].main.feels_like, unit)}
                    {tempUnit}
                  </Text>
                  <Text style={styles.details}>
                    Humidity: {forecast[selectedDay].main.humidity}%
                  </Text>
                  <Text style={styles.details}>
                    Wind speed: {windSpeed(forecast[selectedDay].wind.speed, unit)} {windUnit}
                  </Text>
                  <Text style={styles.details}>
                    Condition: {forecast[selectedDay].weather[0].main}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  demo: { color: '#fff', backgroundColor: '#23466b', padding: 10, textAlign: 'center', marginTop: 12, borderRadius: 8 },
  container: { flex: 1 },
  background: { flex: 1 },
  overlay: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    width: '100%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  unitButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  result: {
    alignItems: 'center',
  },
  city: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  temp: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 28,
    color: '#fff',
  },
  details: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  updated: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 15,
    fontStyle: 'italic',
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
  },
  selectedCard: {
    backgroundColor: '#1E90FF',
  },
  forecastDate: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  forecastTemp: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  forecastCondition: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  forecastDetails: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 15,
    borderRadius: 10,
  },
});
