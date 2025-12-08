import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';

// Conditional import for QR scanner (requires expo-camera)
let CameraView: any = null;
let useCameraPermissions: any = null;

if (Platform.OS !== 'web') {
  try {
    const ExpoCamera = require('expo-camera');
    CameraView = ExpoCamera.CameraView;
    useCameraPermissions = ExpoCamera.useCameraPermissions;
  } catch {
    console.warn('expo-camera not installed');
  }
}

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

/**
 * Composant Scanner QR pour la chasse au trésor
 * Phase 4 - Gamification
 */
export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [permission, requestPermission] =
    Platform.OS !== 'web' && useCameraPermissions
      ? useCameraPermissions()
      : [null, null];
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    onScan(data);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.webIcon}>📱</Text>
          <Text style={styles.webTitle}>Scanner QR Code</Text>
          <Text style={styles.webText}>
            Le scanner QR est disponible uniquement sur mobile.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!CameraView || !useCameraPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Scanner non disponible</Text>
          <Text style={styles.errorText}>
            La caméra n'est pas disponible sur cet appareil.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>
            Demande de permission caméra...
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={styles.errorTitle}>Permission requise</Text>
          <Text style={styles.errorText}>
            L'accès à la caméra est nécessaire pour scanner les QR codes.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={requestPermission}
          >
            <Text style={styles.closeButtonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { marginTop: 12, backgroundColor: colors.gray400 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                {scanned
                  ? 'QR Code scanné ! 🎉'
                  : 'Placez le QR code dans le cadre'}
              </Text>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>Scanner à nouveau</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  instructions: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructionsText: {
    ...typography.h6,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  rescanButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rescanButtonText: {
    ...typography.labelMedium,
    color: colors.white,
  },
  webIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  webTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  webText: {
    ...typography.bodyMedium,
    color: colors.gray300,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.gray300,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
