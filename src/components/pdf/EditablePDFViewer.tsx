import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { Download, Edit3, Save, X } from 'lucide-react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications: string[];
}

interface CoverLetterData {
  content: string;
  sections: {
    opening: string;
    body: string[];
    closing: string;
  };
}

interface EditablePDFViewerProps {
  resumeData: ResumeData;
  coverLetterData: CoverLetterData;
  onClose: () => void;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderLeft: '4 solid #2563eb',
    paddingLeft: 8,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 9,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillTag: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '3 6',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 5,
    marginBottom: 3,
  },
});

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.name}</Text>
        <Text style={styles.title}>{data.personalInfo.title}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.personalInfo.email}</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text>{data.personalInfo.location}</Text>
        </View>
      </View>

      {/* Summary */}
      {data.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.text}>{data.personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.jobTitle}>{exp.position}</Text>
                  <Text style={styles.company}>{exp.company}</Text>
                </View>
                <Text style={styles.duration}>{exp.duration}</Text>
              </View>
              <Text style={styles.text}>{exp.description}</Text>
              {exp.achievements.map((achievement, achIndex) => (
                <Text key={achIndex} style={styles.text}>• {achievement}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.jobTitle}>{edu.degree}</Text>
                  <Text style={styles.company}>{edu.institution}</Text>
                </View>
                <Text style={styles.duration}>{edu.year}</Text>
              </View>
              {edu.gpa && <Text style={styles.text}>GPA: {edu.gpa}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {data.skills.technical.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 3 }]}>Technical Skills:</Text>
            <View style={styles.skillsContainer}>
              {data.skills.technical.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
        {data.skills.soft.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 3 }]}>Soft Skills:</Text>
            <View style={styles.skillsContainer}>
              {data.skills.soft.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
        {data.skills.tools.length > 0 && (
          <View>
            <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 3 }]}>Tools & Technologies:</Text>
            <View style={styles.skillsContainer}>
              {data.skills.tools.map((tool, index) => (
                <Text key={index} style={styles.skillTag}>{tool}</Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Projects */}
      {data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((project, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.jobTitle}>{project.name}</Text>
              <Text style={styles.text}>{project.description}</Text>
              <View style={styles.skillsContainer}>
                {project.technologies.map((tech, techIndex) => (
                  <Text key={techIndex} style={styles.skillTag}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {data.certifications.map((cert, index) => (
            <Text key={index} style={styles.text}>• {cert}</Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

const CoverLetterPDF: React.FC<{ data: CoverLetterData; personalInfo: ResumeData['personalInfo'] }> = ({ data, personalInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.name}</Text>
        <View style={styles.contactInfo}>
          <Text>{personalInfo.email}</Text>
          <Text>{personalInfo.phone}</Text>
          <Text>{personalInfo.location}</Text>
        </View>
      </View>

      {/* Date */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
      </View>

      {/* Content */}
      <View style={styles.section}>
        <Text style={styles.text}>{data.content}</Text>
      </View>

      {/* Signature */}
      <View style={[styles.section, { marginTop: 30 }]}>
        <Text style={styles.text}>Sincerely,</Text>
        <Text style={[styles.text, { marginTop: 20, fontWeight: 'bold' }]}>{personalInfo.name}</Text>
      </View>
    </Page>
  </Document>
);

const EditablePDFViewer: React.FC<EditablePDFViewerProps> = ({ resumeData, coverLetterData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  const [editableResumeData, setEditableResumeData] = useState<ResumeData>(resumeData);
  const [editableCoverLetterData, setEditableCoverLetterData] = useState<CoverLetterData>(coverLetterData);
  const [isEditing, setIsEditing] = useState(false);

  const handleDownloadResume = async () => {
    const blob = await pdf(<ResumePDF data={editableResumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editableResumeData.personalInfo.name}_Resume.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCoverLetter = async () => {
    const blob = await pdf(<CoverLetterPDF data={editableCoverLetterData} personalInfo={editableResumeData.personalInfo} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editableResumeData.personalInfo.name}_CoverLetter.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Documents
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'resume'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab('cover-letter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'cover-letter'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Cover Letter
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Edit3 size={16} />
              {isEditing ? 'View' : 'Edit'}
            </button>
            <button
              onClick={activeTab === 'resume' ? handleDownloadResume : handleDownloadCoverLetter}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'resume' ? (
            <div className="bg-white p-8 shadow-lg rounded-lg">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Editable Resume Form */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editableResumeData.personalInfo.name}
                        onChange={(e) => setEditableResumeData({
                          ...editableResumeData,
                          personalInfo: { ...editableResumeData.personalInfo, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Full Name"
                      />
                      <input
                        type="email"
                        value={editableResumeData.personalInfo.email}
                        onChange={(e) => setEditableResumeData({
                          ...editableResumeData,
                          personalInfo: { ...editableResumeData.personalInfo, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        value={editableResumeData.personalInfo.phone}
                        onChange={(e) => setEditableResumeData({
                          ...editableResumeData,
                          personalInfo: { ...editableResumeData.personalInfo, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={editableResumeData.personalInfo.location}
                        onChange={(e) => setEditableResumeData({
                          ...editableResumeData,
                          personalInfo: { ...editableResumeData.personalInfo, location: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Location"
                      />
                    </div>
                    <input
                      type="text"
                      value={editableResumeData.personalInfo.title}
                      onChange={(e) => setEditableResumeData({
                        ...editableResumeData,
                        personalInfo: { ...editableResumeData.personalInfo, title: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-4"
                      placeholder="Professional Title"
                    />
                    <textarea
                      value={editableResumeData.personalInfo.summary}
                      onChange={(e) => setEditableResumeData({
                        ...editableResumeData,
                        personalInfo: { ...editableResumeData.personalInfo, summary: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-4"
                      rows={3}
                      placeholder="Professional Summary"
                    />
                  </div>
                  {/* Add more editable sections as needed */}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resume Preview */}
                  <div className="border-b-2 border-blue-600 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{editableResumeData.personalInfo.name}</h1>
                    <h2 className="text-xl text-blue-600 font-semibold mb-4">{editableResumeData.personalInfo.title}</h2>
                    <div className="flex gap-4 text-gray-600">
                      <span>{editableResumeData.personalInfo.email}</span>
                      <span>{editableResumeData.personalInfo.phone}</span>
                      <span>{editableResumeData.personalInfo.location}</span>
                    </div>
                  </div>

                  {editableResumeData.personalInfo.summary && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
                        Professional Summary
                      </h3>
                      <p className="text-gray-700">{editableResumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {/* Experience Section */}
                  {editableResumeData.experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                        Professional Experience
                      </h3>
                      {editableResumeData.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                              <p className="text-blue-600 font-medium">{exp.company}</p>
                            </div>
                            <span className="text-gray-600 text-sm">{exp.duration}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{exp.description}</p>
                          {exp.achievements.length > 0 && (
                            <ul className="list-disc list-inside text-gray-700 ml-4">
                              {exp.achievements.map((achievement, achIndex) => (
                                <li key={achIndex}>{achievement}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add more sections as needed */}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 shadow-lg rounded-lg">
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Cover Letter Content</h3>
                  <textarea
                    value={editableCoverLetterData.content}
                    onChange={(e) => setEditableCoverLetterData({
                      ...editableCoverLetterData,
                      content: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={20}
                    placeholder="Cover letter content..."
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cover Letter Preview */}
                  <div className="border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{editableResumeData.personalInfo.name}</h1>
                    <div className="flex gap-4 text-gray-600">
                      <span>{editableResumeData.personalInfo.email}</span>
                      <span>{editableResumeData.personalInfo.phone}</span>
                      <span>{editableResumeData.personalInfo.location}</span>
                    </div>
                  </div>

                  <div className="text-gray-600">
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {editableCoverLetterData.content}
                  </div>

                  <div className="mt-8">
                    <p className="text-gray-700">Sincerely,</p>
                    <p className="font-semibold text-gray-900 mt-4">{editableResumeData.personalInfo.name}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditablePDFViewer;