import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { EntryProvider } from './src/context/EntryContext';
import { MarketProvider } from './src/context/MarketContext';
import { ProductProvider } from './src/context/ProductContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MarketDashboardScreen from './src/screens/MarketDashboardScreen';
import { MarketsScreen } from './src/screens/MarketsScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';
import {
  LayoutDashboard,
  History,
  Store,
  User as UserIcon
} from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          if (route.name === 'Asosiy') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Tarix') return <History size={size} color={color} />;
          if (route.name === 'Do\'konlar') return <Store size={size} color={color} />;
          if (route.name === 'Profil') return <UserIcon size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Asosiy" component={DashboardScreen} />
      <Tab.Screen name="Tarix" component={RecordsScreen} />
      <Tab.Screen name="Do'konlar" component={MarketsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          {userRole === 'market' ? (
            <Stack.Screen name="MarketDashboard" component={MarketDashboardScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="Products" component={ProductsScreen} />
            </>
          )}
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
    <SafeAreaProvider>
      <AuthProvider>
        <MarketProvider>
          <ProductProvider>
            <EntryProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </EntryProvider>
          </ProductProvider>
        </MarketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
