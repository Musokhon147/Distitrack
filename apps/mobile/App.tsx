import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { EntryProvider } from './src/context/EntryContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MarketDashboardScreen from './src/screens/MarketDashboardScreen';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './src/lib/supabase';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { session, user, loading } = useAuth();
  const [userRole, setUserRole] = useState<'seller' | 'market' | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role);
        }
      }
      setRoleLoading(false);
    };

    if (user) {
      fetchRole();
    } else {
      setRoleLoading(false);
      setUserRole(null);
    }
  }, [user]);

  if (loading || (session && roleLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f8fafc' } }}>
      {session ? (
        <>
          {userRole === 'market' ? (
            <Stack.Screen name="MarketDashboard" component={MarketDashboardScreen} />
          ) : (
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          )}
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EntryProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </EntryProvider>
    </AuthProvider>
  );
}
