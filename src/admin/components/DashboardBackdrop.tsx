import React from 'react';
import { StyleSheet, View } from 'react-native';
import { vivid } from '../../marketing/vividPalette';

// A fixed layer of large, low-opacity color blobs sitting behind the sidebar
// and content area. The sidebar/topbar/cards are all translucent with
// backdropFilter blur, so this gives the glassmorphism something colorful to
// actually blur — without it the "glass" panels would just look flat/gray.
export function DashboardBackdrop() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...(StyleSheet.absoluteFillObject as object),
    position: 'fixed',
    overflow: 'hidden',
  } as any,
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobA: {
    width: 480,
    height: 480,
    top: -160,
    left: 160,
    backgroundColor: vivid.blue,
    opacity: 0.16,
  },
  blobB: {
    width: 420,
    height: 420,
    bottom: -140,
    right: 60,
    backgroundColor: vivid.purple,
    opacity: 0.14,
  },
  blobC: {
    width: 320,
    height: 320,
    bottom: 80,
    left: '38%',
    backgroundColor: vivid.cyan,
    opacity: 0.1,
  },
});
