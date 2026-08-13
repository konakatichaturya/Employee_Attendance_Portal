import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vivid } from '../marketing/vividPalette';

// Soft, low-opacity color blobs sitting behind a screen's scroll content —
// native counterpart to the web dashboard's DashboardBackdrop. Gives
// glassmorphic cards/panels rendered on top something colorful to blur.
export function GradientBlobBackdrop() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobA: {
    width: 280,
    height: 280,
    top: -100,
    right: -80,
    backgroundColor: vivid.blue,
    opacity: 0.12,
  },
  blobB: {
    width: 240,
    height: 240,
    top: 220,
    left: -100,
    backgroundColor: vivid.purple,
    opacity: 0.1,
  },
});
