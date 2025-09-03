import * as Print from 'expo-print';

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

export const generateSafetyMeetingPDF = async (
  meetingInfo: MeetingInfo,
  attendees: Attendee[]
): Promise<string | null> => {
  try {
    const filledAttendees = attendees.filter(a => a.name.trim());
    const presentAttendees = filledAttendees.filter(a => a.isPresent);
    const absentAttendees = filledAttendees.filter(a => !a.isPresent);
    const signedCount = presentAttendees.filter(a => a.signature).length;

    const attendeeRows = filledAttendees.map((attendee, index) => {
      if (attendee.isPresent) {
        return `
          <tr>
            <td class="cell number-cell">${index + 1}</td>
            <td class="cell name-cell">${attendee.name}</td>
            <td class="cell status-cell ${attendee.signature ? 'signed' : 'unsigned'}">
              ${attendee.signature ? '✓ Signed' : '⚠ Not Signed'}
            </td>
            <td class="cell date-cell">${attendee.date}</td>
          </tr>
        `;
      } else {
        return `
          <tr class="absent-row">
            <td class="cell number-cell">${index + 1}</td>
            <td class="cell name-cell">${attendee.name}</td>
            <td class="cell status-cell absent">
              Absent: ${attendee.absentReason || 'Not specified'}
            </td>
            <td class="cell date-cell">${attendee.date}</td>
          </tr>
        `;
      }
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Safety Meeting Attendance Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
            font-size: 14px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .header .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 12px;
          }
          
          .header .generated {
            font-size: 12px;
            color: #9ca3af;
          }
          
          .meeting-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          
          .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .detail-value {
            font-size: 16px;
            font-weight: 500;
            color: #1f2937;
          }
          
          .summary-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .attendance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .attendance-table th {
            background: #f3f4f6;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .cell {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
          }
          
          .number-cell {
            text-align: center;
            font-weight: 600;
            background: #f8fafc;
            width: 60px;
          }
          
          .name-cell {
            font-weight: 500;
            min-width: 200px;
          }
          
          .status-cell {
            text-align: center;
            font-weight: 500;
            min-width: 150px;
          }
          
          .status-cell.signed {
            color: #059669;
          }
          
          .status-cell.unsigned {
            color: #dc2626;
          }
          
          .status-cell.absent {
            color: #dc2626;
            font-style: italic;
          }
          
          .date-cell {
            text-align: center;
            color: #6b7280;
            width: 120px;
          }
          
          .absent-row {
            background: #fef2f2;
          }
          
          .absent-row .cell {
            border-bottom-color: #fecaca;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.5;
          }
          
          .footer p {
            margin-bottom: 8px;
          }
          
          .compliance-note {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 12px;
            margin-top: 16px;
          }
          
          .compliance-note strong {
            color: #92400e;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .meeting-details {
              break-inside: avoid;
            }
            
            .attendance-table {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Safety Meeting Attendance Report</h1>
          <div class="subtitle">Official Documentation of Safety Training Participation</div>
          <div class="generated">Generated on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
        
        <div class="meeting-details">
          <div class="detail-item">
            <div class="detail-label">Meeting Date</div>
            <div class="detail-value">${new Date(meetingInfo.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Location</div>
            <div class="detail-value">${meetingInfo.location || 'Not specified'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Facilitator</div>
            <div class="detail-value">${meetingInfo.facilitator || 'Not specified'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Safety Topic</div>
            <div class="detail-value">${meetingInfo.topic || 'General Safety Training'}</div>
          </div>
        </div>
        
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">${meetingInfo.expectedCount}</div>
            <div class="stat-label">Expected</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${signedCount}</div>
            <div class="stat-label">Signed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${presentAttendees.length - signedCount}</div>
            <div class="stat-label">Present (Unsigned)</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${absentAttendees.length}</div>
            <div class="stat-label">Absent</div>
          </div>
        </div>
        
        <table class="attendance-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Employee Name</th>
              <th>Attendance Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${attendeeRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Document Integrity:</strong> This attendance record was generated digitally and contains electronic signatures where applicable.</p>
          <p><strong>Compliance:</strong> This document serves as official record of safety training attendance as required by workplace safety regulations.</p>
          <p><strong>Contact:</strong> For questions regarding this attendance record, please contact the meeting facilitator listed above.</p>
          
          <div class="compliance-note">
            <p><strong>Important:</strong> This digital attendance record is legally equivalent to paper-based sign-in sheets when properly maintained and stored according to company policy.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 612, // 8.5 inches at 72 DPI
      height: 792, // 11 inches at 72 DPI
    });

    return uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    return null;
  }
};