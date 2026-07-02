import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeHeaderButton from '../components/HomeHeaderButton';
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2d5a3d' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: '#edeae3' },
          headerTitleAlign: 'center',
        }}
      >
    <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="Home" options={{ headerShown: false }} />

     {/* 
     <Stack.Screen name="HallList" options={{ title: 'Explore Halls' }} />
      <Stack.Screen name="HallDetail" options={{ title: "Today's Menu" }} />
      <Stack.Screen name="FoodDetail" options={{ title: 'Food Detail' }} />
      <Stack.Screen name="Feast" options={{ title: 'Feast' }} />
      <Stack.Screen name="Notices" options={{ title: 'Notices' }} />
       <Stack.Screen name="FoodSearch" options={{ title: 'Search Food' }} />
        */}
               {/* Student screens — Home button added 
        <Stack.Screen
          name="HallList"
          options={{ title: 'Explore Halls', headerRight: () => <HomeHeaderButton /> }}
        />
        */}
             <Stack.Screen name="HallList" options={{ title: 'Explore Halls' }} />
        <Stack.Screen
          name="HallDetail"
          options={{ title: "Today's Menu", headerRight: () => <HomeHeaderButton /> }}
        />
        <Stack.Screen
          name="FoodDetail"
          options={{ title: 'Food Detail', headerRight: () => <HomeHeaderButton /> }}
        />
         <Stack.Screen name="Feast" options={{ title: 'Feast' }} />
        <Stack.Screen name="Notices" options={{ title: 'Notices' }} />
        {/* 
        <Stack.Screen
          name="Feast"
          options={{ title: 'Feast', headerRight: () => <HomeHeaderButton /> }}
        />
        <Stack.Screen
          name="Notices"
          options={{ title: 'Notices', headerRight: () => <HomeHeaderButton /> }}
        />
          */}
        <Stack.Screen name="FoodSearch" options={{ title: 'Search Food', headerRight: () => <HomeHeaderButton /> }} />
     
      <Stack.Screen name="ModeratorRole" options={{ title: 'Moderator' }} />
      <Stack.Screen name="ModeratorLogin" options={{ title: 'Moderator Login' }} />
      <Stack.Screen name="ModeratorDashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="QuickStatus" options={{ title: 'Quick Update' }} />
      <Stack.Screen name="MenuEditor" options={{ title: 'Update Menu' }} />
      <Stack.Screen name="CanteenMenuEditor" options={{ title: 'Update Canteen Menu' }} />
      <Stack.Screen name="CanteenQuickStatus" options={{ title: 'Quick Canteen Update' }} />
      <Stack.Screen name="NoticeEditor" options={{ title: 'Post Notice' }} />
      <Stack.Screen name="FeastEditor" options={{ title: 'Add Feast' }} />
      <Stack.Screen name="EditNotice" options={{ title: 'Edit Notice' }} />
      <Stack.Screen name="EditFeast" options={{ title: 'Edit Feast' }} />
      <Stack.Screen name="DailyReset" options={{ title: 'Daily Reset' }} />
      <Stack.Screen name="Verification" options={{ title: 'Verification' }} />
      <Stack.Screen name="SuccessScreen" options={{ headerShown: false }} />
       <Stack.Screen name="AvailableFood"      options={{ title: 'Available Food Menu' }} />
      </Stack>
    </SafeAreaProvider>
  );
}


//npm run deploy