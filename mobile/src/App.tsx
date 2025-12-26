import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, Platform} from 'react-native';
import {Provider as PaperProvider, MD3DarkTheme} from 'react-native-paper';

// Import screens
import HomeScreen from './screens/HomeScreen';
import OutpatientScreen from './screens/OutpatientScreen';
import InpatientScreen from './screens/InpatientScreen';
import DatabaseScreen from './screens/DatabaseScreen';

export type RootStackParamList = {
  Home: undefined;
  Outpatient: undefined;
  Inpatient: undefined;
  Database: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom medical theme
const medicalTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#10b981', // emerald-500
    primaryContainer: '#064e3b', // emerald-900
    secondary: '#6ee7b7', // emerald-300
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    surfaceVariant: '#334155', // slate-700
    onSurface: '#f1f5f9', // slate-100
    onSurfaceVariant: '#cbd5e1', // slate-300
  },
};

const App: React.FC = () => {
  return (
    <PaperProvider theme={medicalTheme}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0f172a" 
        translucent={false}
        networkActivityIndicatorVisible={false}
        hidden={false}
        animated={true}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0f172a',
              elevation: 8,
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              borderBottomWidth: 1,
              borderBottomColor: '#1e293b',
            },
            headerTintColor: '#f1f5f9',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
              color: '#f1f5f9',
            },
            headerTitleAlign: 'center',
            headerStatusBarHeight: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : undefined,
            headerBackTitleVisible: false,
            headerPressColorAndroid: '#10b981',
            headerBackButtonMenuEnabled: true,
            headerShown: true,
          }}>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              title: 'Hospital Bill Calculator',
              headerShown: true
            }}
          />
          <Stack.Screen 
            name="Outpatient" 
            component={OutpatientScreen}
            options={{ 
              title: 'Outpatient Calculator',
              headerShown: true,
              headerBackVisible: true
            }}
          />
          <Stack.Screen 
            name="Inpatient" 
            component={InpatientScreen}
            options={{ 
              title: 'Inpatient Calculator',
              headerShown: true,
              headerBackVisible: true
            }}
          />
          <Stack.Screen 
            name="Database" 
            component={DatabaseScreen}
            options={{ 
              title: 'Medical Items Database',
              headerShown: true,
              headerBackVisible: true
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;