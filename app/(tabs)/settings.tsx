import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon,
  Mail,
  User,
  Building,
  Save,
  RotateCcw,
  Smartphone,
  Tablet,
  Info
} from 'lucide-react-native';

interface AppSettings {
  defaultFacilitator: string;
  defaultLocation: string;
  companyEmail: string;
  autoSaveEnabled: boolean;
  tabletModeEnabled: boolean;
  defaultAttendeeCount: number;
}

export default function SettingsScreen() {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  const [settings, setSettings] = useState<AppSettings>({
    defaultFacilitator: '',
    defaultLocation: '',
    companyEmail: 'safety@company.com',
    autoSaveEnabled: true,
    tabletModeEnabled: isTablet,
    defaultAttendeeCount: 10,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to AsyncStorage or a database
    Alert.alert('Settings Saved', 'Your preferences have been saved successfully.');
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              defaultFacilitator: '',
              defaultLocation: '',
              companyEmail: 'safety@company.com',
              autoSaveEnabled: true,
              tabletModeEnabled: isTablet,
              defaultAttendeeCount: 10,
            });
            setHasUnsavedChanges(true);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          isTablet && styles.tabletContentContainer
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, isTablet && styles.tabletHeader]}>
          <SettingsIcon size={isTablet ? 32 : 28} color="#2563eb" />
          <Text style={[styles.title, isTablet && styles.tabletTitle]}>
            App Settings
          </Text>
          <Text style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
            Configure your safety meeting preferences
          </Text>
        </View>

        {/* Device Info */}
        <View style={[styles.section, isTablet && styles.tabletSection]}>
          <View style={styles.sectionHeader}>
            {isTablet ? (
              <Tablet size={isTablet ? 24 : 20} color="#2563eb" />
            ) : (
              <Smartphone size={isTablet ? 24 : 20} color="#2563eb" />
            )}
            <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
              Device Information
            </Text>
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceInfoText, isTablet && styles.tabletDeviceInfoText]}>
              Screen Size: {Math.round(width)} × {Math.round(height)}
            </Text>
            <Text style={[styles.deviceInfoText, isTablet && styles.tabletDeviceInfoText]}>
              Device Type: {isTablet ? 'Tablet' : 'Phone'}
            </Text>
            <Text style={[styles.deviceInfoText, isTablet && styles.tabletDeviceInfoText]}>
              Orientation: {isLandscape ? 'Landscape' : 'Portrait'}
            </Text>
            <Text style={[styles.deviceInfoText, isTablet && styles.tabletDeviceInfoText]}>
              Platform: {Platform.OS}
            </Text>
          </View>
        </View>

        {/* Default Values */}
        <View style={[styles.section, isTablet && styles.tabletSection]}>
          <View style={styles.sectionHeader}>
            <User size={isTablet ? 24 : 20} color="#2563eb" />
            <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
              Default Values
            </Text>
          </View>
          
          <View style={[styles.formGrid, isTablet && isLandscape && styles.tabletFormGrid]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Default Facilitator</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={settings.defaultFacilitator}
                onChangeText={(text) => updateSetting('defaultFacilitator', text)}
                placeholder="Your name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Default Location</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={settings.defaultLocation}
                onChangeText={(text) => updateSetting('defaultLocation', text)}
                placeholder="Meeting room or site location"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Company Email</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={settings.companyEmail}
                onChangeText={(text) => updateSetting('companyEmail', text)}
                placeholder="safety@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Default Attendee Count</Text>
              <TextInput
                style={[styles.countInput, isTablet && styles.tabletCountInput]}
                value={settings.defaultAttendeeCount.toString()}
                onChangeText={(text) => {
                  const count = parseInt(text) || 10;
                  updateSetting('defaultAttendeeCount', Math.min(50, Math.max(1, count)));
                }}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={[styles.section, isTablet && styles.tabletSection]}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={isTablet ? 24 : 20} color="#2563eb" />
            <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
              App Preferences
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, isTablet && styles.tabletSettingLabel]}>
                Auto-save Progress
              </Text>
              <Text style={[styles.settingDescription, isTablet && styles.tabletSettingDescription]}>
                Automatically save meeting data as you type
              </Text>
            </View>
            <Switch
              value={settings.autoSaveEnabled}
              onValueChange={(value) => updateSetting('autoSaveEnabled', value)}
              trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
              thumbColor={settings.autoSaveEnabled ? '#2563eb' : '#9ca3af'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, isTablet && styles.tabletSettingLabel]}>
                Tablet Mode
              </Text>
              <Text style={[styles.settingDescription, isTablet && styles.tabletSettingDescription]}>
                Optimize interface for tablet displays
              </Text>
            </View>
            <Switch
              value={settings.tabletModeEnabled}
              onValueChange={(value) => updateSetting('tabletModeEnabled', value)}
              trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
              thumbColor={settings.tabletModeEnabled ? '#2563eb' : '#9ca3af'}
            />
          </View>
        </View>

        {/* iPad Optimization Info */}
        {isTablet && (
          <View style={[styles.section, isTablet && styles.tabletSection]}>
            <View style={styles.sectionHeader}>
              <Info size={isTablet ? 24 : 20} color="#059669" />
              <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
                iPad Optimization
              </Text>
            </View>
            
            <View style={styles.optimizationInfo}>
              <Text style={[styles.optimizationText, isTablet && styles.tabletOptimizationText]}>
                ✓ Responsive layout for all iPad sizes (10.2" - 12.9")
              </Text>
              <Text style={[styles.optimizationText, isTablet && styles.tabletOptimizationText]}>
                ✓ Optimized touch targets and spacing
              </Text>
              <Text style={[styles.optimizationText, isTablet && styles.tabletOptimizationText]}>
                ✓ Enhanced signature capture area
              </Text>
              <Text style={[styles.optimizationText, isTablet && styles.tabletOptimizationText]}>
                ✓ Landscape and portrait orientation support
              </Text>
              <Text style={[styles.optimizationText, isTablet && styles.tabletOptimizationText]}>
                ✓ PDF export and email sharing capabilities
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={[styles.actionSection, isTablet && styles.tabletActionSection]}>
          <View style={[styles.actionButtons, isTablet && isLandscape && styles.tabletActionButtons]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.saveButton,
                isTablet && styles.tabletActionButton,
                !hasUnsavedChanges && styles.disabledButton
              ]}
              onPress={saveSettings}
              disabled={!hasUnsavedChanges}
            >
              <Save size={isTablet ? 24 : 20} color="white" />
              <Text style={[styles.actionButtonText, isTablet && styles.tabletActionButtonText]}>
                Save Settings
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton, isTablet && styles.tabletActionButton]}
              onPress={resetSettings}
            >
              <RotateCcw size={isTablet ? 24 : 20} color="white" />
              <Text style={[styles.actionButtonText, isTablet && styles.tabletActionButtonText]}>
                Reset to Defaults
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabletContentContainer: {
    padding: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tabletHeader: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  tabletTitle: {
    fontSize: 36,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tabletSubtitle: {
    fontSize: 18,
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabletSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  tabletSectionTitle: {
    fontSize: 24,
    marginLeft: 12,
  },
  formGrid: {
    gap: 16,
  },
  tabletFormGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  inputGroup: {
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  tabletLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  tabletInput: {
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
  },
  countInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  tabletCountInput: {
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    width: 100,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  tabletSettingLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabletSettingDescription: {
    fontSize: 16,
  },
  deviceInfo: {
    gap: 8,
  },
  deviceInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabletDeviceInfoText: {
    fontSize: 16,
  },
  optimizationInfo: {
    gap: 8,
  },
  optimizationText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  tabletOptimizationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionSection: {
    marginTop: 16,
  },
  tabletActionSection: {
    marginTop: 24,
  },
  actionButtons: {
    gap: 12,
  },
  tabletActionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  tabletActionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#059669',
  },
  resetButton: {
    backgroundColor: '#dc2626',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabletActionButtonText: {
    fontSize: 18,
  },
});