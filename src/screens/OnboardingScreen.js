import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: null,
    showLogo: true,
    title: 'Welcome to HallMenu RU',
    desc: 'Your simple dining helper for Rajshahi University halls. Check meals and updates anytime from your phone.',
  },
  {
    id: '2',
    icon: '🍽️',
    showLogo: false,
    title: 'See Daily Meals',
    desc: 'View breakfast, lunch, and dinner menu easily. Know what is available before going to the dining hall.',
  },
  {
    id: '3',
    icon: '🔔',
    showLogo: false,
    title: 'Stay Updated',
    desc: 'Get updates about food availability, special feast menus, and important hall dining notices in one place.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  async function finish() {
    // await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/Home');
  }

  function goTo(index) {
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
  }

  function next() {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      finish();
    }
  }

   {/* function back() {
    if (current > 0) goTo(current - 1);
  }  */}

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.iconArea}>
        {item.showLogo ? (
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RU</Text>
          </View>
        ) : (
          <Text style={styles.slideIcon}>{item.icon}</Text>
        )}
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, current === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons 
      <View style={styles.btnRow}>
        {current > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View> */}

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Rajshahi University • Hall Dining</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edeae3',
    paddingBottom: 32,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  skipText: {
    fontSize: 14, color: '#7a7a6e', fontWeight: '600',
  },

  slide: {
    width,
    paddingHorizontal: 32,
    paddingTop: 20,
    alignItems: 'center',  
  },
  iconArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 44,
    marginTop: 24,
  },
  logoBox: {
    width: 88, height: 88,
    borderRadius: 24,
    backgroundColor: '#2d5a3d',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2d5a3d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  logoText: {
    fontSize: 30, fontWeight: '800', color: '#fff',
  },
  slideIcon: {
    fontSize: 64,
  },
  slideTitle: {
    fontSize: 26, fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
    lineHeight: 34,
    textAlign: 'center',
  },
  slideDesc: {
    fontSize: 15, color: '#5a5a50',
    lineHeight: 25,
    textAlign: 'center',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 28,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#c8c4b4',
  },
  dotActive: {
    backgroundColor: '#2d5a3d',
    width: 24,
    borderRadius: 4,
  },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    //gap: 12,
    justifyContent: 'center',
    marginBottom: 18,
  },
  /*
  backBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#dedad0',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15, fontWeight: '700', color: '#5a5a50',
  },
   nextBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#2d5a3d',
    alignItems: 'center',
  },*/
  
  nextBtn: {
    width: '70%',
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#2d5a3d',
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15, fontWeight: '700', color: '#fff',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12, color: '#7a7a6e',
    letterSpacing: 0.3,
  },
});