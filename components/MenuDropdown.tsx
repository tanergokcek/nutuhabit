import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/src/hooks/useTranslation';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  iconColor: string;
  gradStart: string;
  gradEnd: string;
  badge?: boolean;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'aiCoach', label: 'AI Coach',
    icon: 'star', iconColor: '#e9d5ff',
    gradStart: '#7c3aed', gradEnd: '#4c1d95',
    badge: true, route: '/aiCoach',
  },
  {
    key: 'takvim', label: 'Takvim',
    icon: 'calendar', iconColor: '#bfdbfe',
    gradStart: '#1e3a5f', gradEnd: '#1e2d4a',
    route: '/calendarPage',
  },
  {
    key: 'reminder', label: '',
    icon: 'notifications', iconColor: '#fcd34d',
    gradStart: '#92400e', gradEnd: '#78350f',
    route: '/reminder',
  },
  {
    key: 'notlar', label: 'Notlar',
    icon: 'document-text', iconColor: '#5eead4',
    gradStart: '#0f766e', gradEnd: '#134e4a',
    route: '/notes',
  },
  {
    key: 'todos', label: 'Yapılacaklar',
    icon: 'checkbox', iconColor: '#fdba74',
    gradStart: '#c2410c', gradEnd: '#9a3412',
    route: '/todos',
  },
  {
    key: 'ayarlar', label: 'Ayarlar',
    icon: 'settings', iconColor: 'rgba(255,255,255,0.70)',
    gradStart: '#374151', gradEnd: '#1f2937',
    route: '/settings',
  },
];

interface MenuDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export function MenuDropdown({ visible, onClose }: MenuDropdownProps) {
  const router = useRouter();
  const i18n = useTranslation();

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 160);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Küçük ok işareti — tab bar'ın üzerinde */}
        <View style={styles.caret} />

        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(55,15,110,0.82)', 'rgba(10,5,40,0.92)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          {/* İnce border */}
          <View style={styles.cardBorder} />

          {MENU_ITEMS.map((item, index) => {
            const label = item.key === 'reminder' ? i18n.menuReminder : item.label;
            const isLast = index === MENU_ITEMS.length - 1;
            return (
              <React.Fragment key={item.key}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleNav(item.route)}
                  activeOpacity={0.60}
                >
                  {/* İkon */}
                  <View style={styles.iconBox}>
                    <LinearGradient
                      colors={[item.gradStart, item.gradEnd]}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />
                    <Ionicons name={item.icon as any} size={16} color={item.iconColor} />
                    {item.badge && (
                      <View style={styles.badge}>
                        <Ionicons name="star" size={6} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Etiket */}
                  <Text style={styles.label}>{label}</Text>

                  {/* Şevron */}
                  <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.20)" />
                </TouchableOpacity>

                {!isLast && <View style={styles.sep} />}
              </React.Fragment>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const TAB_BOTTOM = Platform.OS === 'ios' ? 100 : 80;
const CARD_WIDTH = 220;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    // Kartı sağ alta, tab bar'ın hemen üstüne yerleştir
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingBottom: TAB_BOTTOM,
  },

  // Küçük üçgen ok
  caret: {
    width: 0,
    height: 0,
    marginRight: 22,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(120,60,220,0.70)',
    marginBottom: -1,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    paddingVertical: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(168,85,247,0.40)',
    // Gölge
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
  },

  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#f97316',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(10,5,40,0.90)',
  },

  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.1,
  },

  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 12,
    marginLeft: 52,
  },
});
