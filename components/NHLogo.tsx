import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface Props {
  size?: number;
  withBackground?: boolean;
}

export default function NHLogo({ size = 64, withBackground = true }: Props) {
  const imgSize = size * 0.72;

  if (withBackground) {
    return (
      <View
        style={[
          styles.bg,
          {
            width: size,
            height: size,
            borderRadius: size * 0.27,
          },
        ]}
      >
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../assets/brand/logomark.png')}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Image
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require('../assets/brand/logomark.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
