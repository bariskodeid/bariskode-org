import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#0a0a0f',
        padding: 60,
        position: 'relative',
    },
    border: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        borderWidth: 2,
        borderColor: '#00ff88',
        borderStyle: 'solid',
    },
    innerBorder: {
        position: 'absolute',
        top: 28,
        left: 28,
        right: 28,
        bottom: 28,
        borderWidth: 1,
        borderColor: '#2a2a3a',
        borderStyle: 'solid',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    platform: {
        fontSize: 12,
        color: '#00ff88',
        letterSpacing: 6,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 28,
        color: '#e5e5e5',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    divider: {
        width: 120,
        height: 2,
        backgroundColor: '#00ff88',
        marginVertical: 20,
        alignSelf: 'center',
    },
    body: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    certLabel: {
        color: '#737373',
        fontSize: 11,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    name: {
        fontSize: 30,
        color: '#00ff88',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    courseLabel: {
        color: '#737373',
        fontSize: 11,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    courseText: {
        color: '#e5e5e5',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 24,
    },
    dateText: {
        color: '#737373',
        fontSize: 11,
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#2a2a3a',
        borderTopStyle: 'solid',
    },
    certId: {
        fontSize: 8,
        color: '#737373',
        letterSpacing: 1,
    },
    verifyUrl: {
        fontSize: 8,
        color: '#00ff88',
        marginTop: 2,
    },
    footerRight: {
        alignItems: 'flex-end',
    },
    qr: {
        width: 62,
        height: 62,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2a2a3a',
        borderStyle: 'solid',
    },
    platformFooter: {
        fontSize: 10,
        color: '#00ff88',
        letterSpacing: 2,
    },
    openSource: {
        fontSize: 7,
        color: '#737373',
        marginTop: 2,
    },
});

interface CertProps {
    certId: string;
    userName: string;
    courseName: string;
    issuedDate: string;
    verifyUrl: string;
    qrDataUrl?: string;
}

export function CertificateTemplate({ certId, userName, courseName, issuedDate, verifyUrl, qrDataUrl }: CertProps) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Borders */}
                <View style={styles.border} />
                <View style={styles.innerBorder} />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.platform}>{'<BARISKODE/>'}</Text>
                    <Text style={styles.subtitle}>Certificate of Completion</Text>
                </View>

                <View style={styles.divider} />

                {/* Body */}
                <View style={styles.body}>
                    <Text style={styles.certLabel}>This certifies that</Text>
                    <Text style={styles.name}>{userName}</Text>
                    <Text style={styles.courseLabel}>has successfully completed the course</Text>
                    <Text style={styles.courseText}>&quot;{courseName}&quot;</Text>
                    <Text style={styles.dateText}>Issued on {issuedDate}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.certId}>Certificate ID: {certId}</Text>
                        <Text style={styles.verifyUrl}>Verify: {verifyUrl}</Text>
                    </View>
                    <View style={styles.footerRight}>
                        {qrDataUrl && <Image style={styles.qr} src={qrDataUrl} />}
                        <Text style={styles.platformFooter}>LEARN.HACK.CERTIFY</Text>
                        <Text style={styles.openSource}>Open Source · bariskode.org</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
