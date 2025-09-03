import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Trash2, Check } from 'lucide-react-native';

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  initialSignature?: string;
}

export default function SignatureCanvas({ onSave, onCancel, initialSignature }: SignatureCanvasProps) {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const pathRef = useRef<string>('');

  const canvasWidth = isTablet ? (isLandscape ? width * 0.7 : width * 0.8) : width * 0.9;
  const canvasHeight = isTablet ? 300 : 200;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = `${pathRef.current} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderRelease: () => {
      setPaths(prev => [...prev, pathRef.current]);
      setCurrentPath('');
      pathRef.current = '';
    },
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  };

  const saveSignature = () => {
    if (paths.length === 0 && !currentPath) {
      Alert.alert('No Signature', 'Please provide a signature before saving.');
      return;
    }

    // In a real implementation, you would convert the SVG paths to a base64 image
    const signatureData = JSON.stringify({ paths, timestamp: Date.now() });
    onSave(signatureData);
  };

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isTablet && styles.tabletTitle]}>
          Digital Signature
        </Text>
        <Text style={[styles.instructions, isTablet && styles.tabletInstructions]}>
          Sign with your finger or stylus in the area below
        </Text>
      </View>

      <View 
        style={[
          styles.canvasContainer,
          isTablet && styles.tabletCanvasContainer,
          { width: canvasWidth, height: canvasHeight }
        ]}
        {...panResponder.panHandlers}
      >
        <Svg
          width={canvasWidth}
          height={canvasHeight}
          style={styles.canvas}
        >
          {paths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="#000"
              strokeWidth={isTablet ? 3 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke="#000"
              strokeWidth={isTablet ? 3 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
        
        {!hasSignature && (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, isTablet && styles.tabletPlaceholderText]}>
              Tap and drag to sign
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.actions, isTablet && styles.tabletActions]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton, isTablet && styles.tabletActionButton]}
          onPress={clearSignature}
        >
          <Trash2 size={isTablet ? 24 : 20} color="#dc2626" />
          <Text style={[styles.clearButtonText, isTablet && styles.tabletClearButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton, isTablet && styles.tabletActionButton]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, isTablet && styles.tabletCancelButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, isTablet && styles.tabletActionButton]}
          onPress={saveSignature}
        >
          <Check size={isTablet ? 24 : 20} color="white" />
          <Text style={[styles.saveButtonText, isTablet && styles.tabletSaveButtonText]}>
            Save Signature
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  tabletContainer: {
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tabletTitle: {
    fontSize: 28,
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  tabletInstructions: {
    fontSize: 18,
  },
  canvasContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    position: 'relative',
    marginBottom: 24,
  },
  tabletCanvasContainer: {
    borderRadius: 16,
    marginBottom: 32,
  },
  canvas: {
    backgroundColor: 'transparent',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tabletPlaceholderText: {
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  tabletActions: {
    gap: 16,
    maxWidth: 600,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabletActionButton: {
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  tabletClearButtonText: {
    fontSize: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabletCancelButtonText: {
    fontSize: 16,
  },
  saveButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  tabletSaveButtonText: {
    fontSize: 16,
  },
});