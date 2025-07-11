'use client';

import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

// Define types for settings
interface PDFSettings {
    fontSize?: number;
    lineHeight?: number;
    marginVertical?: number;
    marginHorizontal?: number;
    nameSize?: number;
    nameSpacing?: number;
}

// Define comprehensive types for resume data
interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
}

interface Experience {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location?: string;
    responsibilities: string[];
}

interface Skills {
    technical: string[];
    soft: string[];
}

interface Education {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    location?: string;
}

interface Project {
    name: string;
    description: string[];
    technologies: string[];
    date?: string;
}

interface ResumeData {
    personal: PersonalInfo;
    summary?: string;
    experience: Experience[];
    skills: Skills;
    education: Education[];
    projects?: Project[];
}

// Base styles for PDF
const createStyles = (settings: PDFSettings = {}) => {
    const {
        fontSize = 10,
        lineHeight = 1.2,
        marginVertical = 20,
        marginHorizontal = 28,
        nameSize = 24,
        nameSpacing = 16,
    } = settings;

    return StyleSheet.create({
        page: {
            paddingTop: marginVertical,
            paddingBottom: marginVertical,
            paddingLeft: marginHorizontal,
            paddingRight: marginHorizontal,
            fontFamily: 'Helvetica',
            fontSize,
            lineHeight,
            color: '#111827',
        },
        header: {
            alignItems: 'center',
            marginBottom: nameSpacing,
        },
        name: {
            fontSize: nameSize,
            fontFamily: 'Helvetica-Bold',
            marginBottom: 8,
            textAlign: 'center',
        },
        contactInfo: {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 4,
            fontSize: fontSize - 1,
            color: '#374151',
        },
        sectionTitle: {
            fontSize: fontSize + 1,
            fontFamily: 'Helvetica-Bold',
            marginTop: 16,
            marginBottom: 8,
            color: '#111827',
            textTransform: 'uppercase',
            borderBottom: '0.5pt solid #e5e7eb',
            paddingBottom: 2,
        },
        sectionContent: {
            marginBottom: 12,
        },
        experienceItem: {
            marginBottom: 12,
        },
        experienceHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        jobTitle: {
            fontFamily: 'Helvetica-Bold',
            fontSize,
        },
        company: {
            fontSize,
            color: '#374151',
        },
        dateRange: {
            fontSize: fontSize - 1,
            color: '#6b7280',
        },
        bulletPoint: {
            flexDirection: 'row',
            marginBottom: 3,
            marginLeft: 12,
        },
        bulletDot: {
            width: 8,
            marginRight: 6,
            fontSize,
        },
        bulletText: {
            flex: 1,
            fontSize,
            color: '#374151',
        },
        skillsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        skillItem: {
            backgroundColor: '#f3f4f6',
            padding: 4,
            borderRadius: 4,
            fontSize: fontSize - 1,
            color: '#374151',
        },
        link: {
            color: '#2563eb',
            textDecoration: 'none',
        },
        text: {
            fontSize: 10,
            lineHeight: 1.2,
            color: '#111827',
            marginBottom: 12,
        },
    });
};

// Process markdown-like formatting with proper typing
const processText = (text: string): string => {
    if (!text) return '';

    // Remove markdown bold syntax for PDF
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
};

interface ResumePDFDocumentProps {
    resumeData: ResumeData;
    settings?: PDFSettings;
}

export const ResumePDFDocument = memo(function ResumePDFDocument({
    resumeData,
    settings
}: ResumePDFDocumentProps) {
    const styles = useMemo(() => createStyles(settings), [settings]);

    // Validate resume data before rendering
    if (!resumeData || !resumeData.personal) {
        console.error('Invalid resume data provided to PDF document');
        return (
            <PDFDocument>
                <PDFPage size="LETTER" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.name}>Resume Preview</Text>
                        <Text style={styles.text}>Invalid resume data provided</Text>
                    </View>
                </PDFPage>
            </PDFDocument>
        );
    }

    return (
        <PDFDocument>
            <PDFPage size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{resumeData.personal.name || 'Unknown'}</Text>
                    <View style={styles.contactInfo}>
                        <Text>{resumeData.personal.email || 'No email'}</Text>
                        <Text> • </Text>
                        <Text>{resumeData.personal.phone || 'No phone'}</Text>
                        {resumeData.personal.location && (
                            <>
                                <Text> • </Text>
                                <Text>{resumeData.personal.location}</Text>
                            </>
                        )}
                        {resumeData.personal.linkedin && (
                            <>
                                <Text> • </Text>
                                <Link src={resumeData.personal.linkedin}>
                                    <Text style={styles.link}>{resumeData.personal.linkedin}</Text>
                                </Link>
                            </>
                        )}
                    </View>
                </View>

                {/* Professional Summary */}
                {resumeData.summary && (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.text}>{processText(resumeData.summary)}</Text>
                    </View>
                )}

                {/* Skills */}
                {(resumeData.skills?.technical?.length > 0 || resumeData.skills?.soft?.length > 0) && (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Core Competencies</Text>
                        <View style={styles.skillsGrid}>
                            {resumeData.skills.technical?.map((skill, index) => (
                                <Text key={`tech-${index}`} style={styles.skillItem}>{skill}</Text>
                            ))}
                            {resumeData.skills.soft?.map((skill, index) => (
                                <Text key={`soft-${index}`} style={styles.skillItem}>{skill}</Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Experience */}
                {resumeData.experience?.length > 0 && (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Professional Experience</Text>
                        {resumeData.experience.map((exp, index) => (
                            <View key={index} style={styles.experienceItem}>
                                <View style={styles.experienceHeader}>
                                    <View>
                                        <Text style={styles.jobTitle}>{exp.position || 'Position'}</Text>
                                        <Text style={styles.company}>{exp.company || 'Company'}{exp.location && ` • ${exp.location}`}</Text>
                                    </View>
                                    <Text style={styles.dateRange}>
                                        {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                                    </Text>
                                </View>
                                {exp.responsibilities?.map((resp, respIndex) => (
                                    <View key={respIndex} style={styles.bulletPoint}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.bulletText}>{processText(resp)}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {resumeData.education?.length > 0 && (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {resumeData.education.map((edu, index) => (
                            <View key={index} style={styles.experienceItem}>
                                <View style={styles.experienceHeader}>
                                    <View>
                                        <Text style={styles.jobTitle}>{edu.degree || 'Degree'} in {edu.field || 'Field'}</Text>
                                        <Text style={styles.company}>{edu.institution || 'Institution'}{edu.location && ` • ${edu.location}`}</Text>
                                    </View>
                                    <Text style={styles.dateRange}>{edu.graduationDate || 'Year'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </PDFPage>
        </PDFDocument>
    );
});

// Export types for use in other components
export type { ResumeData, PDFSettings, PersonalInfo, Experience, Skills, Education, Project };
