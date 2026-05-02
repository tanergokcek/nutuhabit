import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

// Bu ekran hiç görünmez — tab bar FAB butonu doğrudan /habit/new'e yönlendirir.
export default function AddScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/habit/new');
  }, []);
  return <View />;
}
