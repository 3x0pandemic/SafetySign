import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Mail, FileDown, Plus, Trash2, CreditCard as Edit3, CircleCheck as CheckCircle, Circle as XCircle, Calendar, MapPin, User, BookOpen } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

interface Attendee {
  id: string;
  name: string;
  isPresent: boolean;
  signature?: string;
  absentReason?: string;
  date: string;
}

interface MeetingInfo {
  date: string;
  location: string;
  facilitator: string;
  topic: string;
  expectedCount: number;
}

export default function SafetyMeetingScreen() {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({
    date: new Date().toISOString().split('T')[0],
    location: '',
    facilitator: '',
    topic: '',
    expectedCount: 10,
  });
  
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentAttendeeId, setCurrentAttendeeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAttendeeList = () => {
    const newAttendees: Attendee[] = [];
    for (let i = 1; i <= meetingInfo.expectedCount; i++) {
      newAttendees.push({
        id: `attendee-${i}`,
        name: '',
        isPresent: true,
        date: meetingInfo.date,
      });
    }
    setAttendees(newAttendees);
  };

  const updateAttendee = (id: string, updates: Partial<Attendee>) => {
    setAttendees(prev => prev.map(attendee => 
      attendee.id === id ? { ...attendee, ...updates } : attendee
    ));
  };

  const getCompletionStats = () => {
    const filledNames = attendees.filter(a => a.name.trim()).length;
    const presentCount = attendees.filter(a => a.isPresent && a.name.trim()).length;
    const signedCount = attendees.filter(a => a.isPresent && a.signature && a.name.trim()).length;
    const absentCount = attendees.filter(a => !a.isPresent && a.name.trim()).length;
    const meetingInfoComplete = [meetingInfo.location, meetingInfo.facilitator, meetingInfo.topic].filter(Boolean).length;
    
    return {
      filledNames,
      presentCount,
      signedCount,
      absentCount,
      meetingInfoComplete,
      isComplete: signedCount === presentCount && presentCount > 0 && meetingInfoComplete >= 3
    };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const stats = getCompletionStats();
      
      const attendeeRows = attendees
        .filter(a => a.name.trim())
        .map((attendee, index) => {
          if (attendee.isPresent) {
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${attendee.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ${attendee.signature ? '✓ Signed' : '⚠ Not Signed'}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${attendee.date}</td>
              </tr>
            `;
          } else {
            return `
              <tr style="background-color: #fef2f2;">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${attendee.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: #dc2626;">
                  Absent: ${attendee.absentReason || 'Not specified'}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${attendee.date}</td>
              </tr>
            `;
          }
        }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Safety Meeting Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .meeting-info { margin-bottom: 20px; }
            .stats { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #e5e7eb; padding: 10px; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; }
            .signature { max-width: 150px; max-height: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Safety Meeting Attendance Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="meeting-info">
            <h2>Meeting Details</h2>
            <p><strong>Date:</strong> ${meetingInfo.date}</p>
            <p><strong>Location:</strong> ${meetingInfo.location}</p>
            <p><strong>Facilitator:</strong> ${meetingInfo.facilitator}</p>
            <p><strong>Topic:</strong> ${meetingInfo.topic}</p>
          </div>
          
          <div class="stats">
            <h3>Attendance Summary</h3>
            <p><strong>Expected Attendees:</strong> ${meetingInfo.expectedCount}</p>
            <p><strong>Present & Signed:</strong> ${stats.signedCount}</p>
            <p><strong>Present but Not Signed:</strong> ${stats.presentCount - stats.signedCount}</p>
            <p><strong>Absent:</strong> ${stats.absentCount}</p>
            <p><strong>Total Recorded:</strong> ${stats.filledNames}/${meetingInfo.expectedCount}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${attendeeRows}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>This document was generated digitally and contains electronic signatures where applicable.</p>
            <p>For questions regarding this attendance record, please contact the meeting facilitator.</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const shareDocument = async () => {
    const pdfUri = await generatePDF();
    if (!pdfUri) return;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Safety Meeting Report',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Failed to share document. Please try again.');
    }
  };

  const emailReport = async () => {
    const stats = getCompletionStats();
    
    const presentAttendees = attendees.filter(a => a.isPresent && a.name.trim());
    const absentAttendees = attendees.filter(a => !a.isPresent && a.name.trim());
    
    let emailBody = `Safety Meeting Attendance Report\n\n`;
    emailBody += `Meeting Details:\n`;
    emailBody += `• Date: ${meetingInfo.date}\n`;
    emailBody += `• Location: ${meetingInfo.location}\n`;
    emailBody += `• Facilitator: ${meetingInfo.facilitator}\n`;
    emailBody += `• Topic: ${meetingInfo.topic}\n`;
    emailBody += `• Expected Attendees: ${meetingInfo.expectedCount}\n\n`;
    
    emailBody += `ATTENDANCE SUMMARY:\n`;
    emailBody += `• Present & Signed: ${stats.signedCount}\n`;
    emailBody += `• Present but Not Signed: ${stats.presentCount - stats.signedCount}\n`;
    emailBody += `• Absent: ${stats.absentCount}\n`;
    emailBody += `• Total Recorded: ${stats.filledNames}/${meetingInfo.expectedCount}\n\n`;
    
    if (presentAttendees.length > 0) {
      emailBody += `ATTENDEES PRESENT (${presentAttendees.length}):\n`;
      presentAttendees.forEach(attendee => {
        const status = attendee.signature ? 'Signed' : 'Not Signed';
        emailBody += `• ${attendee.name} (${status})\n`;
      });
      emailBody += '\n';
    }
    
    if (absentAttendees.length > 0) {
      emailBody += `ABSENTEES (${absentAttendees.length}):\n`;
      absentAttendees.forEach(attendee => {
        emailBody += `• ${attendee.name} - ${attendee.absentReason || 'Not specified'}\n`;
      });
    }

    try {
      const pdfUri = await generatePDF();
      const attachments = pdfUri ? [pdfUri] : [];

      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Email not available', 'Email is not configured on this device.');
        return;
      }

      await MailComposer.composeAsync({
        recipients: ['safety@company.com'], // Default recipient
        subject: `Safety Meeting Attendance - ${meetingInfo.topic || 'Safety Training'} - ${meetingInfo.date}`,
        body: emailBody,
        attachments,
      });
    } catch (error) {
      console.error('Email error:', error);
      Alert.alert('Error', 'Failed to compose email. Please try again.');
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all meeting data and signatures. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setAttendees([]);
            setMeetingInfo({
              date: new Date().toISOString().split('T')[0],
              location: '',
              facilitator: '',
              topic: '',
              expectedCount: 10,
            });
          }
        }
      ]
    );
  };

  const stats = getCompletionStats();

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
          <Text style={[styles.title, isTablet && styles.tabletTitle]}>
            Safety Meeting Sign-Off
          </Text>
          <Text style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
            Digital Attendance & Signature Collection
          </Text>
        </View>

        {/* Meeting Information */}
        <View style={[styles.section, isTablet && styles.tabletSection]}>
          <View style={styles.sectionHeader}>
            <Calendar size={isTablet ? 24 : 20} color="#2563eb" />
            <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
              Meeting Information
            </Text>
          </View>
          
          <View style={[styles.formGrid, isTablet && isLandscape && styles.tabletFormGrid]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Date</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={meetingInfo.date}
                onChangeText={(text) => setMeetingInfo(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Location</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={meetingInfo.location}
                onChangeText={(text) => setMeetingInfo(prev => ({ ...prev, location: text }))}
                placeholder="Meeting location"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Facilitator</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={meetingInfo.facilitator}
                onChangeText={(text) => setMeetingInfo(prev => ({ ...prev, facilitator: text }))}
                placeholder="Meeting facilitator"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isTablet && styles.tabletLabel]}>Topic</Text>
              <TextInput
                style={[styles.input, isTablet && styles.tabletInput]}
                value={meetingInfo.topic}
                onChangeText={(text) => setMeetingInfo(prev => ({ ...prev, topic: text }))}
                placeholder="Safety topic"
              />
            </View>
          </View>
          
          <View style={[styles.attendeeCountSection, isTablet && styles.tabletAttendeeCountSection]}>
            <Text style={[styles.label, isTablet && styles.tabletLabel]}>Expected Attendees</Text>
            <View style={styles.attendeeCountRow}>
              <TextInput
                style={[styles.countInput, isTablet && styles.tabletCountInput]}
                value={meetingInfo.expectedCount.toString()}
                onChangeText={(text) => {
                  const count = parseInt(text) || 10;
                  setMeetingInfo(prev => ({ ...prev, expectedCount: Math.min(50, Math.max(1, count)) }));
                }}
                keyboardType="numeric"
                maxLength={2}
              />
              <TouchableOpacity
                style={[styles.generateButton, isTablet && styles.tabletGenerateButton]}
                onPress={generateAttendeeList}
              >
                <Users size={isTablet ? 24 : 20} color="white" />
                <Text style={[styles.generateButtonText, isTablet && styles.tabletGenerateButtonText]}>
                  Generate Tables
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Completion Status */}
        {attendees.length > 0 && (
          <View style={[styles.statusSection, isTablet && styles.tabletStatusSection]}>
            <View style={[
              styles.statusCard,
              isTablet && styles.tabletStatusCard,
              stats.isComplete ? styles.statusComplete : styles.statusIncomplete
            ]}>
              <View style={styles.statusHeader}>
                {stats.isComplete ? (
                  <CheckCircle size={isTablet ? 28 : 24} color="#059669" />
                ) : (
                  <XCircle size={isTablet ? 28 : 24} color="#dc2626" />
                )}
                <Text style={[
                  styles.statusTitle,
                  isTablet && styles.tabletStatusTitle,
                  stats.isComplete ? styles.statusTitleComplete : styles.statusTitleIncomplete
                ]}>
                  {stats.isComplete ? 'Ready to Submit' : 'Incomplete'}
                </Text>
              </View>
              <Text style={[styles.statusDetails, isTablet && styles.tabletStatusDetails]}>
                {stats.signedCount}/{stats.presentCount} present signed • {stats.absentCount} absent
                {'\n'}{stats.filledNames}/{meetingInfo.expectedCount} people recorded • {stats.meetingInfoComplete}/4 details filled
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {attendees.length > 0 && (
          <View style={[styles.actionSection, isTablet && styles.tabletActionSection]}>
            <View style={[styles.actionButtons, isTablet && isLandscape && styles.tabletActionButtons]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.emailButton, isTablet && styles.tabletActionButton]}
                onPress={emailReport}
              >
                <Mail size={isTablet ? 24 : 20} color="white" />
                <Text style={[styles.actionButtonText, isTablet && styles.tabletActionButtonText]}>
                  Email Report
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.pdfButton, isTablet && styles.tabletActionButton]}
                onPress={shareDocument}
                disabled={isGenerating}
              >
                <FileDown size={isTablet ? 24 : 20} color="white" />
                <Text style={[styles.actionButtonText, isTablet && styles.tabletActionButtonText]}>
                  {isGenerating ? 'Generating...' : 'Export PDF'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton, isTablet && styles.tabletActionButton]}
                onPress={clearAll}
              >
                <Trash2 size={isTablet ? 24 : 20} color="white" />
                <Text style={[styles.actionButtonText, isTablet && styles.tabletActionButtonText]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Attendee List */}
        {attendees.length > 0 && (
          <View style={[styles.section, isTablet && styles.tabletSection]}>
            <View style={styles.sectionHeader}>
              <Users size={isTablet ? 24 : 20} color="#2563eb" />
              <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>
                Attendance List
              </Text>
            </View>
            
            {attendees.map((attendee, index) => (
              <View key={attendee.id} style={[
                styles.attendeeRow,
                isTablet && styles.tabletAttendeeRow,
                !attendee.isPresent && styles.absentRow
              ]}>
                <View style={styles.attendeeNumber}>
                  <Text style={[styles.numberText, isTablet && styles.tabletNumberText]}>
                    {index + 1}
                  </Text>
                </View>
                
                <View style={[styles.attendeeInfo, isTablet && styles.tabletAttendeeInfo]}>
                  <TextInput
                    style={[styles.nameInput, isTablet && styles.tabletNameInput]}
                    value={attendee.name}
                    onChangeText={(text) => updateAttendee(attendee.id, { name: text })}
                    placeholder="Print full name here"
                    placeholderTextColor="#9ca3af"
                  />
                  
                  <View style={styles.attendeeControls}>
                    <TouchableOpacity
                      style={[
                        styles.presenceToggle,
                        isTablet && styles.tabletPresenceToggle,
                        attendee.isPresent ? styles.presentToggle : styles.absentToggle
                      ]}
                      onPress={() => updateAttendee(attendee.id, { 
                        isPresent: !attendee.isPresent,
                        signature: undefined,
                        absentReason: undefined
                      })}
                    >
                      <Text style={[styles.toggleText, isTablet && styles.tabletToggleText]}>
                        {attendee.isPresent ? 'Present' : 'Absent'}
                      </Text>
                    </TouchableOpacity>
                    
                    {attendee.isPresent ? (
                      <TouchableOpacity
                        style={[
                          styles.signatureButton,
                          isTablet && styles.tabletSignatureButton,
                          attendee.signature && styles.signedButton
                        ]}
                        onPress={() => {
                          setCurrentAttendeeId(attendee.id);
                          setShowSignatureModal(true);
                        }}
                      >
                        <Edit3 size={isTablet ? 20 : 16} color={attendee.signature ? "#059669" : "#6b7280"} />
                        <Text style={[
                          styles.signatureButtonText,
                          isTablet && styles.tabletSignatureButtonText,
                          attendee.signature && styles.signedButtonText
                        ]}>
                          {attendee.signature ? 'Signed' : 'Sign'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={[styles.reasonInput, isTablet && styles.tabletReasonInput]}
                        value={attendee.absentReason || ''}
                        onChangeText={(text) => updateAttendee(attendee.id, { absentReason: text })}
                        placeholder="Reason for absence"
                        placeholderTextColor="#9ca3af"
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isTablet && styles.tabletModalHeader]}>
            <Text style={[styles.modalTitle, isTablet && styles.tabletModalTitle]}>
              Digital Signature
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSignatureModal(false)}
            >
              <Text style={[styles.modalCloseText, isTablet && styles.tabletModalCloseText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.signatureArea, isTablet && styles.tabletSignatureArea]}>
            <Text style={[styles.signatureInstructions, isTablet && styles.tabletSignatureInstructions]}>
              Sign with your finger or stylus in the area below
            </Text>
            
            {/* Signature canvas would go here - simplified for this demo */}
            <View style={[styles.signatureCanvas, isTablet && styles.tabletSignatureCanvas]}>
              <Text style={styles.canvasPlaceholder}>Signature Canvas Area</Text>
            </View>
            
            <View style={[styles.signatureActions, isTablet && styles.tabletSignatureActions]}>
              <TouchableOpacity
                style={[styles.clearSignatureButton, isTablet && styles.tabletClearSignatureButton]}
                onPress={() => {/* Clear signature logic */}}
              >
                <Text style={[styles.clearSignatureText, isTablet && styles.tabletClearSignatureText]}>
                  Clear
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveSignatureButton, isTablet && styles.tabletSaveSignatureButton]}
                onPress={() => {
                  if (currentAttendeeId) {
                    updateAttendee(currentAttendeeId, { signature: 'signature-data' });
                  }
                  setShowSignatureModal(false);
                  setCurrentAttendeeId(null);
                }}
              >
                <Text style={[styles.saveSignatureText, isTablet && styles.tabletSaveSignatureText]}>
                  Save Signature
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  tabletHeader: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  tabletTitle: {
    fontSize: 36,
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
  attendeeCountSection: {
    marginTop: 16,
  },
  tabletAttendeeCountSection: {
    marginTop: 24,
  },
  attendeeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  generateButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabletGenerateButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    gap: 12,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabletGenerateButtonText: {
    fontSize: 18,
  },
  statusSection: {
    marginBottom: 16,
  },
  tabletStatusSection: {
    marginBottom: 24,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  tabletStatusCard: {
    padding: 24,
    borderRadius: 16,
  },
  statusComplete: {
    backgroundColor: '#ecfdf5',
    borderColor: '#059669',
  },
  statusIncomplete: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tabletStatusTitle: {
    fontSize: 24,
    marginLeft: 12,
  },
  statusTitleComplete: {
    color: '#059669',
  },
  statusTitleIncomplete: {
    color: '#dc2626',
  },
  statusDetails: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  tabletStatusDetails: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionSection: {
    marginBottom: 16,
  },
  tabletActionSection: {
    marginBottom: 24,
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
  emailButton: {
    backgroundColor: '#059669',
  },
  pdfButton: {
    backgroundColor: '#7c3aed',
  },
  clearButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabletActionButtonText: {
    fontSize: 18,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabletAttendeeRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  absentRow: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  attendeeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabletNumberText: {
    fontSize: 20,
  },
  attendeeInfo: {
    flex: 1,
  },
  tabletAttendeeInfo: {
    gap: 12,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabletNameInput: {
    fontSize: 18,
    padding: 12,
    marginBottom: 12,
  },
  attendeeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presenceToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabletPresenceToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  presentToggle: {
    backgroundColor: '#dcfce7',
  },
  absentToggle: {
    backgroundColor: '#fee2e2',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabletToggleText: {
    fontSize: 14,
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 4,
  },
  tabletSignatureButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  signedButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#059669',
  },
  signatureButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabletSignatureButtonText: {
    fontSize: 14,
  },
  signedButtonText: {
    color: '#059669',
  },
  reasonInput: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontStyle: 'italic',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  tabletReasonInput: {
    fontSize: 16,
    padding: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabletModalHeader: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabletModalTitle: {
    fontSize: 24,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  tabletModalCloseText: {
    fontSize: 18,
  },
  signatureArea: {
    flex: 1,
    padding: 16,
  },
  tabletSignatureArea: {
    padding: 32,
  },
  signatureInstructions: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabletSignatureInstructions: {
    fontSize: 18,
    marginBottom: 24,
  },
  signatureCanvas: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabletSignatureCanvas: {
    borderRadius: 16,
    marginBottom: 24,
  },
  canvasPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  signatureActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tabletSignatureActions: {
    gap: 16,
  },
  clearSignatureButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabletClearSignatureButton: {
    paddingVertical: 18,
    borderRadius: 10,
  },
  clearSignatureText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabletClearSignatureText: {
    fontSize: 18,
  },
  saveSignatureButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabletSaveSignatureButton: {
    paddingVertical: 18,
    borderRadius: 10,
  },
  saveSignatureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  tabletSaveSignatureText: {
    fontSize: 18,
  },
});