'use client';

import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet } from '@react-pdf/renderer';
import { memo } from 'react';

const styles = StyleSheet.create({
    page: {
        paddingTop: 50,
        paddingBottom: 50,
        paddingLeft: 50,
        paddingRight: 50,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.6,
        color: '#111827',
    },
    header: {
        marginBottom: 30,
    },
    senderInfo: {
        marginBottom: 20,
    },
    name: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
    },
    contactLine: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 2,
    },
    date: {
        marginBottom: 20,
        fontSize: 11,
    },
    recipientInfo: {
        marginBottom: 20,
    },
    recipientLine: {
        fontSize: 11,
        marginBottom: 2,
    },
    salutation: {
        marginBottom: 20,
        fontSize: 11,
    },
    bodyParagraph: {
        marginBottom: 15,
        fontSize: 11,
        textAlign: 'justify',
    },
    closing: {
        marginTop: 20,
        marginBottom: 40,
    },
    signature: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
    },
});

interface CoverLetterPDFDocumentProps {
    coverLetterData: {
        senderInfo: {
            name: string;
            email: string;
            phone: string;
            address?: string;
        };
        recipientInfo: {
            hiringManager: string;
            company: string;
            position: string;
            address?: string;
        };
        content: {
            opening: string;
            body: string[];
            closing: string;
        };
        date: string;
    };
}

export const CoverLetterPDFDocument = memo(function CoverLetterPDFDocument({
    coverLetterData
}: CoverLetterPDFDocumentProps) {
    return (
        <PDFDocument>
            <PDFPage size="LETTER" style={styles.page}>
                {/* Header with sender info */}
                <View style={styles.header}>
                    <View style={styles.senderInfo}>
                        <Text style={styles.name}>{coverLetterData.senderInfo.name}</Text>
                        <Text style={styles.contactLine}>{coverLetterData.senderInfo.email}</Text>
                        <Text style={styles.contactLine}>{coverLetterData.senderInfo.phone}</Text>
                        {coverLetterData.senderInfo.address && (
                            <Text style={styles.contactLine}>{coverLetterData.senderInfo.address}</Text>
                        )}
                    </View>

                    <Text style={styles.date}>{coverLetterData.date}</Text>

                    <View style={styles.recipientInfo}>
                        <Text style={styles.recipientLine}>{coverLetterData.recipientInfo.hiringManager}</Text>
                        <Text style={styles.recipientLine}>{coverLetterData.recipientInfo.company}</Text>
                        {coverLetterData.recipientInfo.address && (
                            <Text style={styles.recipientLine}>{coverLetterData.recipientInfo.address}</Text>
                        )}
                    </View>
                </View>

                {/* Salutation */}
                <Text style={styles.salutation}>
                    Dear {coverLetterData.recipientInfo.hiringManager},
                </Text>

                {/* Opening paragraph */}
                <Text style={styles.bodyParagraph}>
                    {coverLetterData.content.opening}
                </Text>

                {/* Body paragraphs */}
                {coverLetterData.content.body.map((paragraph, index) => (
                    <Text key={index} style={styles.bodyParagraph}>
                        {paragraph}
                    </Text>
                ))}

                {/* Closing paragraph */}
                <Text style={styles.bodyParagraph}>
                    {coverLetterData.content.closing}
                </Text>

                {/* Signature */}
                <View style={styles.closing}>
                    <Text style={styles.bodyParagraph}>Sincerely,</Text>
                    <Text style={styles.signature}>{coverLetterData.senderInfo.name}</Text>
                </View>
            </PDFPage>
        </PDFDocument>
    );
});
