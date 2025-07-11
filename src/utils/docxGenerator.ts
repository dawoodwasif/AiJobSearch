// Enhanced DOCX generation utility
// Install: npm install docx file-saver

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeData {
    personal?: {
        name?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
    };
    summary?: string;
    experience?: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        responsibilities: string[];
    }>;
    skills?: {
        technical?: string[];
        soft?: string[];
    };
    education?: Array<{
        institution: string;
        degree: string;
        field: string;
        graduationDate: string;
    }>;
}

export class DOCXGenerator {
    static async generateResumeDocx(resumeData: ResumeData, filename: string = 'resume.docx'): Promise<void> {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // Header with name
                        ...(resumeData.personal?.name ? [
                            new Paragraph({
                                text: resumeData.personal.name,
                                heading: HeadingLevel.TITLE,
                                alignment: 'center',
                            })
                        ] : []),

                        // Contact information
                        ...(resumeData.personal ? [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: [
                                            resumeData.personal.email,
                                            resumeData.personal.phone,
                                            resumeData.personal.location
                                        ].filter(Boolean).join(' | '),
                                        size: 20,
                                    }),
                                ],
                                alignment: 'center',
                                spacing: { after: 400 },
                            })
                        ] : []),

                        // Professional Summary
                        ...(resumeData.summary ? [
                            new Paragraph({
                                text: 'Professional Summary',
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 400, after: 200 },
                            }),
                            new Paragraph({
                                text: resumeData.summary,
                                spacing: { after: 400 },
                            })
                        ] : []),

                        // Experience
                        ...(resumeData.experience?.length ? [
                            new Paragraph({
                                text: 'Professional Experience',
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 400, after: 200 },
                            }),
                            ...resumeData.experience.flatMap(exp => [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: exp.position,
                                            bold: true,
                                        }),
                                        new TextRun({
                                            text: ` at ${exp.company}`,
                                        }),
                                    ],
                                    spacing: { before: 200, after: 100 },
                                }),
                                new Paragraph({
                                    text: `${exp.startDate} - ${exp.endDate}`,
                                    spacing: { after: 100 },
                                }),
                                ...exp.responsibilities.map(resp =>
                                    new Paragraph({
                                        text: `• ${resp}`,
                                        spacing: { after: 50 },
                                    })
                                ),
                            ])
                        ] : []),

                        // Skills
                        ...(resumeData.skills?.technical?.length || resumeData.skills?.soft?.length ? [
                            new Paragraph({
                                text: 'Skills',
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 400, after: 200 },
                            }),
                            ...(resumeData.skills.technical?.length ? [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: 'Technical Skills: ',
                                            bold: true,
                                        }),
                                        new TextRun({
                                            text: resumeData.skills.technical.join(', '),
                                        }),
                                    ],
                                    spacing: { after: 100 },
                                })
                            ] : []),
                            ...(resumeData.skills.soft?.length ? [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: 'Soft Skills: ',
                                            bold: true,
                                        }),
                                        new TextRun({
                                            text: resumeData.skills.soft.join(', '),
                                        }),
                                    ],
                                    spacing: { after: 100 },
                                })
                            ] : []),
                        ] : []),

                        // Education
                        ...(resumeData.education?.length ? [
                            new Paragraph({
                                text: 'Education',
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 400, after: 200 },
                            }),
                            ...resumeData.education.flatMap(edu => [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${edu.degree} in ${edu.field}`,
                                            bold: true,
                                        }),
                                    ],
                                    spacing: { before: 200, after: 100 },
                                }),
                                new Paragraph({
                                    text: `${edu.institution} - ${edu.graduationDate}`,
                                    spacing: { after: 200 },
                                }),
                            ])
                        ] : []),
                    ],
                },
            ],
        });

        try {
            const blob = await Packer.toBlob(doc);
            saveAs(blob, filename);
        } catch (error) {
            console.error('Error generating DOCX:', error);
            throw new Error('Failed to generate DOCX document');
        }
    }
}
