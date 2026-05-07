import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import { MenuDropdown } from '@/components/MenuDropdown';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useTranslation } from '@/src/hooks/useTranslation';
import { useHabitStore } from '@/src/store/useHabitStore';
import { useThemeStore } from '@/src/store/useThemeStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconName;
  focused: boolean;
  color: string;
  size: number;
}

function TabIcon({ name, focused, color, size }: TabIconProps) {
  return (
    <View style={styles.iconWrapper}>
      {focused ? (
        <LinearGradient
          colors={['#c084fc', '#818cf8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activePill}
        />
      ) : null}
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

// Merkez FAB butonu
function CenterFAB() {
  const router = useRouter();
  const t = useAppTheme();
  const i18n = useTranslation();
  const { selectedDate, activeHomeTab } = useHabitStore();
  const { homeLayout } = useThemeStore();

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = makeLoop(pulse1, 0);
    const a2 = makeLoop(pulse2, 800);
    a1.start();
    a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, [pulse1, pulse2]);

  const ringStyle = (anim: Animated.Value) => ({
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }),
    }],
    opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.7, 0.4, 0] }),
  });

  return (
    <TouchableOpacity
      style={styles.fabWrapper}
      onPress={() => router.push({
        pathname: '/logHabit',
        params: { 
          date: selectedDate,
          ...(homeLayout === 'tabs' ? { type: activeHomeTab } : {})
        }
      })}
      activeOpacity={0.85}
    >
      {/* Pulse rings */}
      <Animated.View style={[styles.pulseRing, ringStyle(pulse1)]} pointerEvents="none" />
      <Animated.View style={[styles.pulseRing, ringStyle(pulse2)]} pointerEvents="none" />

      <LinearGradient
        colors={['#9333ea', '#7c3aed', '#6d28d9']}
        style={styles.fab}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </LinearGradient>
      <Text style={[styles.fabLabel, { color: t.t3 }]}>{i18n.tabAdd}</Text>
    </TouchableOpacity>
  );
}

// Menu tab butonu
function MenuTabButton({ onPress }: { onPress: () => void }) {
  const t = useAppTheme();
  const i18n = useTranslation();
  return (
    <TouchableOpacity
      style={styles.menuTabWrapper}
      onPress={onPress}
      activeOpacity={0.80}
    >
      <View style={[styles.menuTabIcon, { borderColor: t.cardBorder }]}>
        <LinearGradient
          colors={['rgba(109,40,217,0.50)', 'rgba(60,20,130,0.40)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        <Ionicons name="apps" size={22} color="rgba(192,132,252,0.90)" />
      </View>
      <Text style={[styles.menuTabLabel, { color: t.tabInactive }]}>{i18n.tabMenu}</Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const t = useAppTheme();
  const i18n = useTranslation();

  return (
    <>
    <MenuDropdown visible={menuVisible} onClose={() => setMenuVisible(false)} />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.tabActive,
        tabBarInactiveTintColor: t.tabInactive,
        tabBarStyle: [styles.tabBar, { backgroundColor: t.tabBg, borderTopColor: t.tabBorder }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.tabHome,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: i18n.tabHabits,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />

      {/* Merkez FAB tab */}
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: () => <CenterFAB />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: i18n.tabCharts,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'analytics' : 'analytics-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.tabMenu,
          tabBarButton: () => <MenuTabButton onPress={() => setMenuVisible(true)} />,
        }}
      />

      {/* Gizli ekranlar */}
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 36,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  // Merkez FAB
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 72,
    paddingTop: 0,
    marginTop: -22,
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#a855f7',
    backgroundColor: 'transparent',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192,132,252,0.35)',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  fabLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 5,
  },
  // Menu tab
  menuTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 4,
  },
  menuTabIcon: {
    width: 40, height: 36, borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  menuTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
